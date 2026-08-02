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

  @Post()
  requestReplacement(
    @Body() requestDto: RequestReplacementDto,
    @Req() req: any,
  ) {
    const userId = req.user.id ?? req.user.sub;
    return this.replacementsService.requestReplacement(requestDto, userId);
  }

  @Get()
  findAll(@Req() req: any) {
    const companyId = req.headers['x-company-id'] || req.user?.companyId;
    return this.replacementsService.findAll(companyId);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.replacementsService.approve(
      id,
      body,
      req.user.id ?? req.user.sub,
    );
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.replacementsService.reject(
      id,
      body,
      req.user.id ?? req.user.sub,
    );
  }

  @Patch(':id/dispatch')
  dispatch(@Param('id') id: string, @Body() body: any) {
    return this.replacementsService.dispatch(id, body);
  }

  @Patch(':id/in-transit')
  inTransit(@Param('id') id: string) {
    return this.replacementsService.inTransit(id);
  }

  @Patch(':id/deliver')
  deliver(@Param('id') id: string, @Body() body: any) {
    return this.replacementsService.deliver(id, body);
  }
}
