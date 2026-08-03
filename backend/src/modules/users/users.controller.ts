import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('user.read')
  async findAll(@Req() req: any) {
    // Standardize to use req.user for audit logging if needed, or row-level ownership checks
    return this.usersService.findAll();
  }

  @Post()
  @RequirePermissions('user.create')
  async create(@Body() body: any) {
    return this.usersService.create(body);
  }
}
