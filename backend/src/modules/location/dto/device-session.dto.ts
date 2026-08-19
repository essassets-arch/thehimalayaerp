import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ClientType, LocationPermissionState } from '@prisma/client';

export class CreateDeviceSessionDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @IsString()
  @IsOptional()
  deviceModel?: string;

  @IsString()
  @IsOptional()
  operatingSystem?: string;

  @IsString()
  @IsOptional()
  browser?: string;

  @IsEnum(ClientType)
  @IsOptional()
  clientType?: ClientType;

  @IsEnum(LocationPermissionState)
  @IsOptional()
  locationPermission?: LocationPermissionState;
}
