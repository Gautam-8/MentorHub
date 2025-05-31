import { IsString, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
import { DayOfWeek } from '../entities/availability.entity';

export class CreateAvailabilityDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
} 