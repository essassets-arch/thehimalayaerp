import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  UseGuards,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreateEmployeeDto, EmployeeQueryDto } from './dto/employee.dto';
import { EmployeesService } from './employees.service';
import { PayrollService } from '../payroll/payroll.service';

@Controller('hr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  constructor(
    private readonly employees: EmployeesService,
    private readonly payrollService: PayrollService,
  ) {}

  private async parseEmployeeData(value: string) {
    let payload: unknown;
    try {
      payload = JSON.parse(value);
    } catch {
      throw new BadRequestException({
        code: 'INVALID_EMPLOYEE_DATA',
        message: 'employeeData must be valid JSON.',
      });
    }
    const dto = plainToInstance(CreateEmployeeDto, payload);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });
    if (errors.length) {
      const first = errors[0];
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message:
          Object.values(first.constraints || {})[0] || 'Validation failed.',
        field: first.property,
      });
    }
    (dto as any).additionalDocuments = (payload as any).additionalDocuments;
    return dto;
  }

  @Get('employees')
  @RequirePermissions('hr.employees.read')
  list(@Query() query: EmployeeQueryDto, @Req() req: any) {
    return this.employees.list(query, req.user);
  }

  @Get('employees/payroll-overview')
  @RequirePermissions('hr.payroll.read')
  payrollOverview(@Query() query: any, @Req() req: any) {
    return this.employees.payrollOverview(query, req.user);
  }

  @Get('employees/:employeeId/attendance-summary')
  @RequirePermissions('hr.payroll.read')
  attendanceSummary(
    @Param('employeeId') id: string,
    @Query() query: any,
    @Req() req: any,
  ) {
    return this.employees.attendanceSummary(id, query, req.user);
  }

  @Get('employees/:employeeId/salary-history')
  @RequirePermissions('hr.payroll.read')
  salaryHistory(@Param('employeeId') id: string, @Req() req: any) {
    return this.employees.salaryHistory(id, req.user);
  }

  @Get('employees/drafts')
  @RequirePermissions('hr.employees.create')
  drafts(@Req() req: any) {
    return this.employees.listDrafts(req.user);
  }

  @Get('employees/managers')
  @RequirePermissions('hr.employees.read')
  managers(@Query('excludeId') excludeId: string, @Req() req: any) {
    return this.employees.managers(req.user, excludeId);
  }

  @Get('employees/next-code')
  @RequirePermissions('hr.employees.create')
  nextCode(@Req() req: any) {
    return this.employees.nextCode(req.user);
  }

  @Get('departments')
  @RequirePermissions('hr.departments.read')
  departments(@Req() req: any) {
    return this.employees.departments(req.user);
  }

  @Post('departments')
  @RequirePermissions('hr.departments.read', 'hr.employees.create')
  createDepartment(@Body() body: any, @Req() req: any) {
    return this.employees.createDepartment(body, req.user);
  }

  @Get('work-locations')
  @RequirePermissions('hr.locations.read')
  locations(@Req() req: any) {
    return this.employees.locations(req.user);
  }

  @Post('work-locations')
  @RequirePermissions('hr.locations.read', 'hr.employees.create')
  createWorkLocation(@Body() body: any, @Req() req: any) {
    return this.employees.createWorkLocation(body, req.user);
  }

  @Get('employees/:id')
  @RequirePermissions('hr.employees.read')
  get(@Param('id') id: string, @Req() req: any) {
    return this.employees.get(id, req.user);
  }

  @Post('employees')
  @RequirePermissions('hr.employees.create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'aadhaarCard', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'bankDocument', maxCount: 1 },
        { name: 'photograph', maxCount: 1 },
        { name: 'signature', maxCount: 1 },
        { name: 'additionalDocuments', maxCount: 20 },
      ],
      { storage: undefined, limits: { fileSize: 5 * 1024 * 1024, files: 25 } },
    ),
  )
  async create(
    @Body('employeeData') employeeData: string,
    @UploadedFiles() files: Record<string, any[]>,
    @Req() req: any,
  ) {
    return this.employees.create(
      await this.parseEmployeeData(employeeData),
      files || {},
      req.user,
      req.requestId,
    );
  }

  @Post('employees/drafts')
  @RequirePermissions('hr.employees.create')
  saveDraft(@Body() body: any, @Req() req: any) {
    return this.employees.saveDraft(body, req.user);
  }

  @Patch('employees/:id')
  @RequirePermissions('hr.employees.update')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.employees.update(id, body, req.user, req.requestId);
  }

  @Patch('employees/:id/status')
  @RequirePermissions('hr.employees.status.update')
  status(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.employees.status(id, body, req.user, req.requestId);
  }

  @Post('employees/:id/documents')
  @RequirePermissions('hr.employees.documents.upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: undefined,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  addDocument(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!file)
      throw new BadRequestException({
        code: 'MANDATORY_DOCUMENT_MISSING',
        message: 'A file is required.',
        field: 'file',
      });
    return this.employees.addDocument(id, file, body, req.user);
  }

  @Delete('employees/:employeeId/documents/:documentId')
  @RequirePermissions('hr.employees.documents.delete')
  deleteDocument(
    @Param('employeeId') employeeId: string,
    @Param('documentId') documentId: string,
    @Req() req: any,
  ) {
    return this.employees.deleteDocument(employeeId, documentId, req.user);
  }

  @Delete('employees/:id')
  @RequirePermissions('hr.employees.delete')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.employees.delete(id, req.user);
  }

  // ==========================================
  // SALARY STRUCTURE / CTC ENDPOINTS
  // ==========================================

  @Get('salary-structures')
  @RequirePermissions('hr.payroll.read')
  listSalaryStructures(@Req() req: any) {
    return this.payrollService.listSalaryStructures(req.user);
  }

  @Get('salary-structures/:id')
  @RequirePermissions('hr.payroll.read')
  getSalaryStructure(@Param('id') id: string, @Req() req: any) {
    return this.payrollService.getSalaryStructure(id, req.user);
  }

  @Get('salary-structures/employee/:employeeId')
  @RequirePermissions('hr.payroll.read')
  getEmployeeSalaryStructure(
    @Param('employeeId') employeeId: string,
    @Req() req: any,
  ) {
    return this.payrollService.getEmployeeSalaryStructure(employeeId, req.user);
  }

  @Post('salary-structures')
  @RequirePermissions('hr.payroll.create')
  createSalaryStructure(@Body() body: any, @Req() req: any) {
    return this.payrollService.createSalaryStructure(body, req.user);
  }

  @Put('salary-structures/:id')
  @RequirePermissions('hr.payroll.update')
  updateSalaryStructure(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.payrollService.updateSalaryStructure(id, body, req.user);
  }

  @Patch('salary-structures/:id')
  @RequirePermissions('hr.payroll.update')
  patchSalaryStructure(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.payrollService.updateSalaryStructure(id, body, req.user);
  }

  @Delete('salary-structures/:id')
  @RequirePermissions('hr.payroll.delete')
  deleteSalaryStructure(@Param('id') id: string, @Req() req: any) {
    return this.payrollService.deleteSalaryStructure(id, req.user);
  }
}
