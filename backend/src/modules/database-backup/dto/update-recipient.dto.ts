import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBackupRecipientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
