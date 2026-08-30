import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @IsNumber()
  @IsOptional()
  altitude?: number;

  @IsNumber()
  @IsOptional()
  speed?: number;

  @IsNumber()
  @IsOptional()
  heading?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  batteryLevel?: number;

  @IsString()
  @IsNotEmpty()
  capturedAt: string;
}
