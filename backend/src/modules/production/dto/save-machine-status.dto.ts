import { IsString, IsNotEmpty, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum MachineStatus {
  USE = 'USE',
  NOT_USE = 'NOT_USE',
}

export class MachineStatusItemDto {
  @IsNotEmpty()
  machineId: number;

  @IsEnum(MachineStatus)
  status: MachineStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class SaveMachineStatusDto {
  @IsString()
  @IsNotEmpty()
  workDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MachineStatusItemDto)
  machines: MachineStatusItemDto[];
}
