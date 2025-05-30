import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SessionRequest } from './session-request.entity';

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  mentor: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  mentee: User;

  @ManyToOne(() => SessionRequest, { onDelete: 'CASCADE' })
  sessionRequest: SessionRequest;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({ type: 'text' })
  meetLink: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 