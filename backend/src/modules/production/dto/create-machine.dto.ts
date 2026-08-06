import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMachineDto {
  @IsString()
  @IsNotEmpty()
  machineId: string;

  @IsString()
  @IsNotEmpty()
  machineName: string;

  @IsString()
  @IsNotEmpty()
  machineType: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
