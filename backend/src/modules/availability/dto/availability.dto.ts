import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { DayOfWeek } from '../entities/availability.entity';

export class CreateAvailabilityDto {
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

export class UpdateAvailabilityDto extends CreateAvailabilityDto {} 