import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAllMentors() {
    return this.usersRepository.find({
      where: { role: UserRole.MENTOR },
      select: ['id', 'name'],
    });
  }
} 