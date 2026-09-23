import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseGuards,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocationTrackingService } from './location-tracking.service';
import { BatchTrackingPointsDto, SingleTrackingPointDto } from './dto/tracking-point.dto';

@Controller('location')
@UseGuards(JwtAuthGuard)
export class LocationTrackingController {
  constructor(
    private readonly locationTrackingService: LocationTrackingService,
  ) {}

  /**
   * Mobile background service batch ingestion endpoint.
   * Strictly derives identity from authenticated session.
   */
  @Post('track/batch')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async recordBatchPoints(
    @CurrentUser() user: any,
    @Body() dto: BatchTrackingPointsDto,
  ) {
    if (!user || !user.companyId) {
      throw new BadRequestException('Authenticated session missing company context.');
    }
    return this.locationTrackingService.recordBatchPoints(
      user.sub,
      user.companyId,
      dto,
    );
  }

  /**
   * Single coordinate update fallback for web or real-time pings.
   */
  @Post('track/point')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async recordSinglePoint(
    @CurrentUser() user: any,
    @Body() body: { sessionId: string; point: SingleTrackingPointDto },
  ) {
    if (!body?.sessionId || !body?.point) {
      throw new BadRequestException('sessionId and point are required.');
    }
    return this.locationTrackingService.recordBatchPoints(
      user.sub,
      user.companyId,
      {
        sessionId: body.sessionId,
        points: [body.point],
      },
    );
  }

  /**
   * Get all currently punched-in employees with active location tracking sessions.
   * Scoped by company unless Super Admin.
   */
  @Get('routes/live')
  async getLiveRoutes(@CurrentUser() user: any) {
    const normalizedRole = String(user.role || '')
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    const isSuperAdmin =
      normalizedRole.includes('SUPER_ADMIN') || normalizedRole === 'ADMIN';

    if (isSuperAdmin) {
      return this.locationTrackingService.getLiveRoutes();
    }
    return this.locationTrackingService.getLiveRoutes(user.companyId);
  }

  /**
   * Get historical route for a specific employee on a specific date.
   * Scoped strictly by company/tenant unless Super Admin.
   */
  @Get('routes/history')
  async getHistoricalRoute(
    @CurrentUser() user: any,
    @Query('employeeId') employeeId: string,
    @Query('date') dateStr: string,
  ) {
    if (!employeeId || !dateStr) {
      throw new BadRequestException('employeeId and date (YYYY-MM-DD) are required.');
    }

    const normalizedRole = String(user.role || '')
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    const isSuperAdmin =
      normalizedRole.includes('SUPER_ADMIN') || normalizedRole === 'ADMIN';

    return this.locationTrackingService.getHistoricalRoute(
      isSuperAdmin ? undefined : user.companyId,
      employeeId,
      dateStr,
    );
  }

  /**
   * List tracking sessions for a specific date (defaults to today) or employee.
   */
  @Get('routes/sessions')
  async getSessions(
    @CurrentUser() user: any,
    @Query('date') dateStr?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    const normalizedRole = String(user.role || '')
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    const isSuperAdmin =
      normalizedRole.includes('SUPER_ADMIN') || normalizedRole === 'ADMIN';

    return this.locationTrackingService.getSessions(
      isSuperAdmin ? undefined : user.companyId,
      dateStr,
      employeeId,
    );
  }
}
