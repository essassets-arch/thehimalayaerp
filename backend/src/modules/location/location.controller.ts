import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { LocationService, LiveUserResponse } from './location.service';
import { CreateDeviceSessionDto } from './dto/device-session.dto';
import { UpdateLocationDto } from './dto/location-update.dto';
import { UpdateLocationPermissionDto } from './dto/location-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('location')
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  /**
   * Register/Refresh client device session
   */
  @Post('session')
  async registerSession(
    @CurrentUser() user: any,
    @Body() dto: CreateDeviceSessionDto,
  ) {
    return this.locationService.registerSession(user.sub, user.companyId, dto);
  }

  /**
   * REST presence heartbeat to keep user marked online
   */
  @Post('heartbeat')
  async heartbeat(
    @CurrentUser() user: any,
    @Body() body: { sessionId: string },
  ) {
    if (!body?.sessionId) {
      throw new BadRequestException('sessionId is required');
    }
    await this.locationService.heartbeat(user.sub, body.sessionId);
    return { success: true };
  }

  /**
   * REST fallback to update location coordinates
   */
  @Post('location-update')
  async updateLocation(
    @CurrentUser() user: any,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationService.updateLocation(user.sub, user.companyId, dto);
  }

  /**
   * REST fallback to update location permission state
   */
  @Post('permission')
  async updatePermission(
    @CurrentUser() user: any,
    @Body() dto: UpdateLocationPermissionDto,
  ) {
    return this.locationService.updatePermission(user.sub, dto.sessionId, dto.locationPermission);
  }

  /**
   * Endpoint to retrieve live user dashboard list
   */
  @Get('live-users')
  async getLiveUsers(@CurrentUser() user: any): Promise<LiveUserResponse[]> {
    const normalizedRole = String(user.role || '').toUpperCase().replace(/[\s-]+/g, '_');
    const isSuperAdmin = normalizedRole.includes('SUPER_ADMIN') || normalizedRole === 'ADMIN';

    if (isSuperAdmin) {
      return this.locationService.getLiveUsers();
    }
    return this.locationService.getLiveUsers(user.companyId);
  }
}
