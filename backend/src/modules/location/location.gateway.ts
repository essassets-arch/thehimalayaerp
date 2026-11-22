import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  LocationService,
  ONLINE_THRESHOLD_SECONDS,
  RECENT_THRESHOLD_SECONDS,
} from './location.service';
import { UpdateLocationDto } from './dto/location-update.dto';
import { CreateDeviceSessionDto } from './dto/device-session.dto';
import { UpdateLocationPermissionDto } from './dto/location-permission.dto';
import { UsePipes, ValidationPipe, Logger, Optional } from '@nestjs/common';
import { SessionSecurityService } from '../../common/security/session-security.service';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  namespace: '/',
})
export class LocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(LocationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly locationService: LocationService,
    @Optional() private readonly sessionSecurity?: SessionSecurityService,
  ) {
    this.sessionSecurity?.onForceLogout((evt) => {
      this.broadcastForceLogout(evt);
    });
  }

  broadcastForceLogout(evt: {
    userId?: string;
    sessionId?: string;
    reason: string;
  }) {
    if (!this.server) return;
    const payload = {
      code: 'SESSION_REVOKED',
      reason: evt.reason || 'Your session was terminated by an administrator.',
      sessionId: evt.sessionId || null,
      userId: evt.userId || null,
      timestamp: new Date().toISOString(),
    };

    if (evt.sessionId) {
      const room = `session:${evt.sessionId}`;
      this.server.to(room).emit('session:force-logout', payload);
      setTimeout(() => {
        this.server.in(room).disconnectSockets(true);
      }, 250);
    } else if (evt.userId) {
      const room = `user:${evt.userId}`;
      this.server.to(room).emit('session:force-logout', payload);
      setTimeout(() => {
        this.server.in(room).disconnectSockets(true);
      }, 250);
    }
  }

  /**
   * Handshake and Authenticate Socket Connection
   */
  async handleConnection(socket: Socket) {
    try {
      const rawToken =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization;

      if (!rawToken) {
        this.logger.warn(
          `Connection attempt without token: socket id ${socket.id}`,
        );
        socket.disconnect(true);
        return;
      }

      const token =
        typeof rawToken === 'string'
          ? rawToken.replace(/^Bearer\s+/i, '').trim()
          : rawToken;
      const secret =
        this.configService.get<string>('jwt.accessSecret') ||
        process.env.JWT_ACCESS_SECRET ||
        process.env.JWT_SECRET ||
        'secret';
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Enforce instant session revocation on WebSocket handshakes too
      if (this.sessionSecurity) {
        await this.sessionSecurity.validateAccessSession(payload);
      }

      // Attach user identity to socket
      socket.data.user = {
        userId: payload.sub,
        sid: payload.sid || null,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
        permissions: payload.permissions || [],
      };

      // Join user & auth-session rooms for instant force-logout delivery
      if (payload.sub) {
        await socket.join(`user:${payload.sub}`);
      }
      if (payload.sid) {
        await socket.join(`session:${payload.sid}`);
      }

      const { role, companyId, permissions } = socket.data.user;

      // Check if user is Super Admin, Admin, or has live map permission
      const normalizedRole = String(role || '')
        .toUpperCase()
        .replace(/[\s-]+/g, '_');
      const isSuperAdmin =
        normalizedRole === 'SUPER_ADMIN' ||
        normalizedRole === 'SUPER_ADMIN_ROLE' ||
        normalizedRole === 'SUPER_ADMIN_PORTAL';
      const isAdmin =
        isSuperAdmin ||
        normalizedRole === 'ADMIN' ||
        normalizedRole.includes('ADMIN') ||
        normalizedRole.includes('PLANT_HEAD') ||
        normalizedRole.includes('HR') ||
        normalizedRole.includes('DIRECTOR') ||
        normalizedRole.includes('MANAGEMENT');
      const hasMapPermission =
        (permissions && permissions.includes('LIVE_USER_MAP_VIEW')) || isAdmin;

      if (hasMapPermission) {
        if (companyId) {
          const roomName = `company:${companyId}:live-users`;
          await socket.join(roomName);
          this.logger.log(
            `Admin ${socket.data.user.email} joined real-time dashboard room: ${roomName}`,
          );
        }

        if (isSuperAdmin || !companyId) {
          await socket.join('global:live-users');
          this.logger.log(
            `Super Admin ${socket.data.user.email} joined global real-time room: global:live-users`,
          );
        }
      }

      this.logger.log(
        `User connected: ${socket.data.user.email} (${socket.id})`,
      );
    } catch (err: any) {
      this.logger.warn(
        `WebSocket connection authentication failed: ${err.message}`,
      );
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    if (socket.data.user) {
      this.logger.log(
        `User disconnected: ${socket.data.user.email} (${socket.id})`,
      );
      // Update disconnect logs but rely on lastSeenAt for offline determination
      const companyId = socket.data.user.companyId;

      const disconnectData = {
        userId: socket.data.user.userId,
        socketId: socket.id,
        disconnectedAt: new Date().toISOString(),
      };

      if (companyId) {
        const roomName = `company:${companyId}:live-users`;
        this.server.to(roomName).emit('device:disconnected', disconnectData);
      }
      this.server
        .to('global:live-users')
        .emit('device:disconnected', disconnectData);
    }
  }

  /**
   * Client session registration / presence declaration
   */
  @SubscribeMessage('device:register')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleDeviceRegister(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: CreateDeviceSessionDto,
  ) {
    const user = socket.data.user;
    if (!user) return;

    try {
      const result = await this.locationService.registerSession(
        user.userId,
        user.companyId,
        dto,
      );
      socket.data.sessionId = result.sessionId;

      const payload = {
        userId: user.userId,
        email: user.email,
        name: user.name || 'User',
        role: user.role,
        sessionId: result.sessionId,
        deviceId: dto.deviceId,
        deviceType: dto.deviceType,
        deviceModel: dto.deviceModel,
        operatingSystem: dto.operatingSystem,
        browser: dto.browser,
        clientType: dto.clientType || 'WEB',
        locationPermission: dto.locationPermission || 'PROMPT',
        lastSeenAt: new Date().toISOString(),
        status: 'ONLINE',
      };

      if (user.companyId) {
        const roomName = `company:${user.companyId}:live-users`;
        this.server.to(roomName).emit('device:connected', payload);
      }
      this.server.to('global:live-users').emit('device:connected', payload);

      return { success: true, sessionId: result.sessionId };
    } catch (err: any) {
      this.logger.error(`Device registration error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Heartbeat to maintain online status independently of GPS
   */
  @SubscribeMessage('user:presence:heartbeat')
  async handleHeartbeat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { sessionId: string },
  ) {
    const user = socket.data.user;
    if (!user || !body?.sessionId)
      return { success: false, error: 'Session ID required' };

    try {
      await this.locationService.heartbeat(user.userId, body.sessionId);

      const payload = {
        userId: user.userId,
        sessionId: body.sessionId,
        lastSeenAt: new Date().toISOString(),
        status: 'ONLINE',
      };

      if (user.companyId) {
        const roomName = `company:${user.companyId}:live-users`;
        this.server.to(roomName).emit('device:heartbeat', payload);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Direct location submission via websocket
   */
  @SubscribeMessage('user:location:update')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleLocationUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: UpdateLocationDto,
  ) {
    const user = socket.data.user;
    if (!user) return { success: false, error: 'Unauthenticated' };

    try {
      const loc = await this.locationService.updateLocation(
        user.userId,
        user.companyId,
        dto,
      );

      if (loc?.isSuspiciousJump) {
        this.logger.warn(
          `Filtered suspicious jump broadcast for user ${user.userId}`,
        );
        return {
          success: true,
          filtered: true,
          message: 'Suspicious GPS jump filtered',
        };
      }

      const roomName = `company:${user.companyId}:live-users`;
      const payload = {
        userId: user.userId,
        sessionId: dto.sessionId,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        accuracy: dto.accuracy,
        speed: dto.speed,
        heading: dto.heading,
        batteryLevel: dto.batteryLevel,
        capturedAt: dto.capturedAt,
        status: 'ONLINE',
      };

      this.server.to(roomName).emit('user:location:update', payload);
      this.server.to('global:live-users').emit('user:location:update', payload);

      return { success: true };
    } catch (err: any) {
      this.logger.error(`WebSocket location update failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sync browser location permission changes
   */
  @SubscribeMessage('user:permission:update')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handlePermissionUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: UpdateLocationPermissionDto,
  ) {
    const user = socket.data.user;
    if (!user) return { success: false, error: 'Unauthenticated' };

    try {
      await this.locationService.updatePermission(
        user.userId,
        dto.sessionId,
        dto.locationPermission,
      );

      const roomName = `company:${user.companyId}:live-users`;
      const payload = {
        userId: user.userId,
        sessionId: dto.sessionId,
        locationPermission: dto.locationPermission,
        status: 'ONLINE',
      };

      this.server.to(roomName).emit('device:permission:update', payload);
      this.server
        .to('global:live-users')
        .emit('device:permission:update', payload);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
