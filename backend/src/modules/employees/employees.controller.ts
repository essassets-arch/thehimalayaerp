import {
  BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post,
  Query, Req, UploadedFile, UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateEmployeeDto, EmployeeQueryDto } from './dto/employee.dto';
import { EmployeesService } from './employees.service';

@Controller('hr')
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  private async parseEmployeeData(value: string) {
    let payload: unknown;
    try { payload = JSON.parse(value); } catch { throw new BadRequestException({ code: 'INVALID_EMPLOYEE_DATA', message: 'employeeData must be valid JSON.' }); }
    const dto = plainToInstance(CreateEmployeeDto, payload);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: false });
    if (errors.length) {
      const first = errors[0];
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: Object.values(first.constraints || {})[0] || 'Validation failed.', field: first.property });
    }
    (dto as any).additionalDocuments = (payload as any).additionalDocuments;
    return dto;
  }

  @Get('employees')
  @Permissions('hr.employees.read')
  list(@Query() query: EmployeeQueryDto, @Req() req: any) {
    return this.employees.list(query, req.user);
  }

  @Get('employees/payroll-overview')
  @Permissions('hr.payroll.read')
  payrollOverview(@Query() query: any, @Req() req: any) {
    return this.employees.payrollOverview(query, req.user);
  }

  @Get('employees/:employeeId/attendance-summary')
  @Permissions('hr.payroll.read')
  attendanceSummary(@Param('employeeId') id: string, @Query() query: any, @Req() req: any) {
    return this.employees.attendanceSummary(id, query, req.user);
  }

  @Get('employees/:employeeId/salary-history')
  @Permissions('hr.payroll.read')
  salaryHistory(@Param('employeeId') id: string, @Req() req: any) {
    return this.employees.salaryHistory(id, req.user);
  }

  @Get('employees/drafts')
  @Permissions('hr.employees.create')
  drafts(@Req() req: any) {
    return this.employees.listDrafts(req.user);
  }

  @Get('employees/managers')
  @Permissions('hr.employees.read')
  managers(@Query('excludeId') excludeId: string, @Req() req: any) {
    return this.employees.managers(req.user, excludeId);
  }

  @Get('departments')
  @Permissions('hr.departments.read')
  departments(@Req() req: any) {
    return this.employees.departments(req.user);
  }

  @Get('work-locations')
  @Permissions('hr.locations.read')
  locations(@Req() req: any) {
    return this.employees.locations(req.user);
  }

  @Get('employees/:id')
  @Permissions('hr.employees.read')
  get(@Param('id') id: string, @Req() req: any) {
    return this.employees.get(id, req.user);
  }

  @Post('employees')
  @Permissions('hr.employees.create')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'aadhaarCard', maxCount: 1 }, { name: 'panCard', maxCount: 1 },
    { name: 'bankDocument', maxCount: 1 }, { name: 'photograph', maxCount: 1 },
    { name: 'signature', maxCount: 1 }, { name: 'additionalDocuments', maxCount: 20 },
  ], { storage: undefined, limits: { fileSize: 5 * 1024 * 1024, files: 25 } }))
  async create(@Body('employeeData') employeeData: string, @UploadedFiles() files: Record<string, any[]>, @Req() req: any) {
    return this.employees.create(await this.parseEmployeeData(employeeData), files || {}, req.user, req.requestId);
  }

  @Post('employees/drafts')
  @Permissions('hr.employees.create')
  saveDraft(@Body() body: any, @Req() req: any) {
    return this.employees.saveDraft(body, req.user);
  }

  @Patch('employees/:id')
  @Permissions('hr.employees.update')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.employees.update(id, body, req.user, req.requestId);
  }

  @Patch('employees/:id/status')
  @Permissions('hr.employees.status.update')
  status(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.employees.status(id, body, req.user, req.requestId);
  }

  @Post('employees/:id/documents')
  @Permissions('hr.employees.documents.upload')
  @UseInterceptors(FileInterceptor('file', { storage: undefined, limits: { fileSize: 5 * 1024 * 1024 } }))
  addDocument(@Param('id') id: string, @UploadedFile() file: any, @Body() body: any, @Req() req: any) {
    if (!file) throw new BadRequestException({ code: 'MANDATORY_DOCUMENT_MISSING', message: 'A file is required.', field: 'file' });
    return this.employees.addDocument(id, file, body, req.user);
  }

  @Delete('employees/:employeeId/documents/:documentId')
  @Permissions('hr.employees.documents.delete')
  deleteDocument(@Param('employeeId') employeeId: string, @Param('documentId') documentId: string, @Req() req: any) {
    return this.employees.deleteDocument(employeeId, documentId, req.user);
  }
}
