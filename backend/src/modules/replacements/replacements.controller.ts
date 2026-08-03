import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReplacementsService } from './replacements.service';
import { RequestReplacementDto } from './dto/request-replacement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('replacements')
@UseGuards(JwtAuthGuard)
export class ReplacementsController {
  constructor(private readonly replacementsService: ReplacementsService) {}

  @RequirePermissions('admin.replacements.create')
  @Post()
  requestReplacement(
    @Body() requestDto: RequestReplacementDto,
    @Req() req: any,
  ) {
    const userId = req.user.id ?? req.user.sub;
    return this.replacementsService.requestReplacement(requestDto, userId);
  }

  @RequirePermissions('admin.replacements.read')
  @Get()
  findAll(@Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId;
    return this.replacementsService.findAll(companyId);
  }

  @RequirePermissions('admin.replacements.approve')
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.replacementsService.approve(
      id,
      body,
      req.user.id ?? req.user.sub,
    );
  }

  @RequirePermissions('admin.replacements.reject')
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.replacementsService.reject(
      id,
      body,
      req.user.id ?? req.user.sub,
    );
  }

  @RequirePermissions('admin.replacements.update')
  @Patch(':id/dispatch')
  dispatch(@Param('id') id: string, @Body() body: any) {
    return this.replacementsService.dispatch(id, body);
  }

  @RequirePermissions('admin.replacements.update')
  @Patch(':id/in-transit')
  inTransit(@Param('id') id: string) {
    return this.replacementsService.inTransit(id);
  }

  @RequirePermissions('admin.replacements.update')
  @Patch(':id/deliver')
  deliver(@Param('id') id: string, @Body() body: any) {
    return this.replacementsService.deliver(id, body);
  }
}
