import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ReplacementsService } from './replacements.service';
import { RequestReplacementDto } from './dto/request-replacement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('replacements')
@UseGuards(JwtAuthGuard)
export class ReplacementsController {
  constructor(private readonly replacementsService: ReplacementsService) {}

  @Post()
  requestReplacement(@Body() requestDto: RequestReplacementDto, @Req() req: any) {
    const userId = req.user.id;
    return this.replacementsService.requestReplacement(requestDto, userId);
  }

  @Get()
  findAll() {
    return this.replacementsService.findAll();
  }
}
