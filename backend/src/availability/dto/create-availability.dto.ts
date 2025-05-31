import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateAvailabilityDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  dayOfWeek: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
} 