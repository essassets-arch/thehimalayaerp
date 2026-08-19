import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  ForbiddenException,
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
   * (Scoped to /super-admin/live-users conceptually on frontend, but routed to /location/live-users here or handled under /super-admin/live-users context)
   * Note: The instruction specifies mapping `/super-admin/live-users`, so we will route it under `super-admin/live-users` prefix if possible.
   * Wait, we can controller map a route to 'super-admin/live-users' or we can add it to this controller.
   * Let's put it on the controller path prefix or explicitly specify path:
   * `@Get('/super-admin/live-users')`! Yes! In NestJS, `@Get('/super-admin/live-users')` will override the class-level prefix if starting with a slash, or we can use another controller or let it override.
   * Wait! In NestJS, a path starting with `/` overrides the controller prefix! Let's verify:
   * Yes, `@Get('/super-admin/live-users')` or we can define a dedicated route in `SuperAdminController`. But defining it here or as a custom route path is perfect.
   * Wait, in SuperAdminController:
   * `@Controller(['admin', 'super-admin', 'backend/admin', 'backend/super-admin'])`
   * To keep things clean, let's specify path `@Get('/api/v1/super-admin/live-users')` or let the routing handle it.
   * Actually, let's write it in this controller as `@Get('/super-admin/live-users')` (or `@Get('live-users')` and we can map it).
   * Let's check how the frontend routes it. The frontend calls:
   * `backendFetch('/super-admin/live-users')` which maps to `/api/backend/super-admin/live-users` and is proxied to backend as `/super-admin/live-users`.
   * So the backend controller should expose `@Get('/super-admin/live-users')` or we can expose it in a controller starting with `super-admin` prefix.
   * Let's make it start with `@Controller()` and explicitly specify routes, or put it in `LocationController` but use `@Get('/super-admin/live-users')` to match!
   * Wait, let's check NestJS controller routing. In NestJS, class-level prefix (e.g. `'location'`) and method-level path (e.g. `'/super-admin/live-users'`) concatenate to `'location/super-admin/live-users'` UNLESS we define a separate controller.
   * Ah! It concatenates. So if the class prefix is `'location'`, the route becomes `'location/super-admin/live-users'`.
   * Therefore, to expose `/super-admin/live-users` cleanly, we should either:
   * 1. Register a separate controller `SuperAdminLiveMapController` under prefix `'super-admin'`, or
   * 2. Put the `live-users` endpoint in the existing `SuperAdminController` in `super-admin.controller.ts` and inject `LocationService` there!
   * Option 2 is incredibly elegant and complies perfectly with NestJS conventions! Let's check `SuperAdminController` again:
   * It has prefix `@Controller(['admin', 'super-admin', 'backend/admin', 'backend/super-admin'])`.
   * So if we define `@Get('live-users')` inside `SuperAdminController`, the route `/super-admin/live-users` will match perfectly!
   * This is brilliant! Let's implement `GET /super-admin/live-users` in `SuperAdminController` by injecting `LocationService` (or we can just put it there).
   * And we can keep the client-side session registration under the `LocationController` (prefix `location`).
   * Let's verify:
   * - `POST /location/session`
   * - `POST /location/location-update`
   * - `POST /location/permission`
   * will be inside `LocationController`.
   * - `GET /super-admin/live-users` will be inside `SuperAdminController`.
   * Let's do that!
   */
}
