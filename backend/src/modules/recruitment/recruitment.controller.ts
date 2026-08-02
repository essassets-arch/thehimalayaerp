import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RecruitmentService } from './recruitment.service';

@Controller('hr')
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  @Post('recruitment-requests')
  @Permissions('hr.recruitment.requests.create')
  create(@Body() body: any, @Req() req: any) {
    return this.service.create(body, req.user);
  }

  @Get('recruitment-requests/my-requests')
  @Permissions('hr.recruitment.requests.read.own')
  own(@Req() req: any) {
    return this.service.list(req.user, true);
  }

  @Get('recruitment-requests')
  @Permissions('hr.recruitment.requests.read.all')
  list(@Req() req: any, @Query() query: any) {
    return this.service.list(req.user, false, query);
  }

  @Get('recruitment-requests/:id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.service.get(id, req.user);
  }

  @Patch('recruitment-requests/:id')
  @Permissions('hr.recruitment.requests.update.own')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.updateOwn(id, body, req.user);
  }

  @Post('recruitment-requests/:id/resubmit')
  @Permissions('hr.recruitment.requests.update.own')
  resubmit(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.resubmit(id, body, req.user);
  }

  @Post('recruitment-requests/:id/withdraw')
  @Permissions('hr.recruitment.requests.withdraw')
  withdraw(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.withdraw(id, body, req.user);
  }

  @Post('recruitment-requests/:id/start-processing')
  @Permissions('hr.recruitment.requests.process')
  start(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.transition(id, 'HR_PROCESSING', body, req.user);
  }

  @Post('recruitment-requests/:id/return-for-correction')
  @Permissions('hr.recruitment.requests.return')
  returnForCorrection(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.service.transition(
      id,
      'RETURNED_FOR_CORRECTION',
      body,
      req.user,
    );
  }

  @Post('recruitment-requests/:id/put-on-hold')
  @Permissions('hr.recruitment.requests.process')
  hold(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.transition(id, 'ON_HOLD', body, req.user);
  }

  @Post('recruitment-requests/:id/pending')
  @Permissions('hr.recruitment.requests.process')
  pending(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.pending(id, body, req.user);
  }

  @Post('recruitment-requests/:id/reject')
  @Permissions('hr.recruitment.requests.reject')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.reject(id, body, req.user);
  }

  @Post('recruitment-requests/:id/fulfil')
  @Permissions('hr.recruitment.requests.fulfil')
  fulfil(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.fulfil(id, body, req.user);
  }

  @Get('recruitment-requests/:id/candidates')
  @Permissions('hr.recruitment.requests.read.all')
  candidates(@Param('id') id: string, @Req() req: any) {
    return this.service.getChildren(id, req.user, 'candidates');
  }

  @Post('recruitment-requests/:id/candidates')
  @Permissions('hr.recruitment.candidates.create')
  addCandidate(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.addCandidate(id, body, req.user);
  }

  @Patch('recruitment-candidates/:candidateId')
  @Permissions('hr.recruitment.candidates.update')
  updateCandidate(
    @Param('candidateId') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.service.updateCandidate(id, body, req.user);
  }

  @Post('recruitment-candidates/:candidateId/select')
  @Permissions('hr.recruitment.candidates.update')
  selectCandidate(
    @Param('candidateId') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.service.candidateDecision(id, 'SELECTED', body, req.user);
  }

  @Post('recruitment-candidates/:candidateId/reject')
  @Permissions('hr.recruitment.candidates.update')
  rejectCandidate(
    @Param('candidateId') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.service.candidateDecision(id, 'REJECTED', body, req.user);
  }

  @Get('recruitment-requests/:id/interviews')
  @Permissions('hr.recruitment.requests.read.all')
  interviews(@Param('id') id: string, @Req() req: any) {
    return this.service.getChildren(id, req.user, 'interviews');
  }

  @Post('recruitment-requests/:id/interviews')
  @Permissions('hr.recruitment.interviews.create')
  addInterview(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.addInterview(id, body, req.user);
  }

  @Patch('recruitment-interviews/:interviewId')
  @Permissions('hr.recruitment.interviews.update')
  updateInterview(
    @Param('interviewId') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.service.updateInterview(id, body, req.user);
  }

  @Post('recruitment-interviews/:interviewId/:action')
  @Permissions('hr.recruitment.interviews.update')
  interviewAction(
    @Param('interviewId') id: string,
    @Param('action') action: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.service.interviewAction(id, action, body, req.user);
  }

  @Get('recruitment-requests/:id/timeline')
  getTimeline(@Param('id') id: string, @Req() req: any) {
    return this.service.getChildren(id, req.user, 'timeline');
  }
}
