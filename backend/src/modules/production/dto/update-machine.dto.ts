import { IsString, IsOptional } from 'class-validator';

export class UpdateMachineDto {
  @IsString()
  @IsOptional()
  machineId?: string;

  @IsString()
  @IsOptional()
  machineName?: string;

  @IsString()
  @IsOptional()
  machineType?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
