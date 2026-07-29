import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeeFilesService } from './employee-files.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeeFilesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
