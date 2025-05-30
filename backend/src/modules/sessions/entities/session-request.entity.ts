import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Availability } from '../../availability/entities/availability.entity';

export enum SessionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
}

@Entity('session_requests')
export class SessionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  mentee: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  mentor: User;

  @ManyToOne(() => Availability, { onDelete: 'CASCADE' })
  availability: Availability;

  @Column({
    type: 'enum',
    enum: SessionRequestStatus,
    default: SessionRequestStatus.PENDING,
  })
  status: SessionRequestStatus;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 