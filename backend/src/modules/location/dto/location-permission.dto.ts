import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { LocationPermissionState } from '@prisma/client';

export class UpdateLocationPermissionDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsEnum(LocationPermissionState)
  locationPermission: LocationPermissionState;
}
