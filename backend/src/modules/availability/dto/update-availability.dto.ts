import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { DayOfWeek } from '../entities/availability.entity';

export class UpdateAvailabilityDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(DayOfWeek)
  @IsOptional()
  dayOfWeek?: DayOfWeek;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;
} 