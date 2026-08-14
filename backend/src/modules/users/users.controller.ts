import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('user.read', 'finance.read', 'sales.orders.read', 'admin.read', 'hr.read', 'store.read', 'super-admin.read', 'plant.read')
  async findAll(@Req() req: any) {
    // Standardize to use req.user for audit logging if needed, or row-level ownership checks
    return this.usersService.findAll();
  }

  @Post()
  @RequirePermissions('user.create')
  async create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Put(':id')
  @RequirePermissions('user.update')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Post(':id/reset-password')
  @RequirePermissions('user.update')
  async resetPassword(@Param('id') id: string, @Body('new_password') newPassword: string) {
    return this.usersService.resetPassword(id, newPassword);
  }

  @Post(':id/toggle-status')
  @RequirePermissions('user.update')
  async toggleStatus(@Param('id') id: string, @Body('status') status: string) {
    const isActive = status === 'Active' || status === 'true' || status === 'active';
    return this.usersService.toggleStatus(id, isActive);
  }

  @Delete(':id')
  @RequirePermissions('user.delete')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
