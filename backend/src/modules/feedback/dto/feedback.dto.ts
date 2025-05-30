import { IsUUID, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsUUID()
  sessionId: string;

  @IsUUID()
  toUserId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
} 