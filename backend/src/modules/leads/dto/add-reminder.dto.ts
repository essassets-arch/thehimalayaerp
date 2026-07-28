import { IsString, IsOptional, IsInt, IsISO8601 } from 'class-validator';

export class AddReminderDto {
  @IsISO8601()
  reminderAt: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsInt()
  expectedVersion: number;
}
