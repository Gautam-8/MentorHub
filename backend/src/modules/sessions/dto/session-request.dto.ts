import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSessionRequestDto {
  @IsUUID()
  @IsNotEmpty()
  availabilityId: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateSessionRequestDto {
  @IsString()
  @IsNotEmpty()
  status: 'APPROVED' | 'DECLINED';
} 