import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { CreateAvailabilityDto } from './dto/availability.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilityDto, mentor: User) {
    if (mentor.role !== UserRole.MENTOR) {
      throw new ForbiddenException('Only mentors can create availability slots');
    }

    const availability = this.availabilityRepository.create({
      ...createAvailabilityDto,
      mentor,
    });

    return this.availabilityRepository.save(availability);
  }

  async findAllByMentor(mentorId: string) {
    return this.availabilityRepository.find({
      where: { mentor: { id: mentorId } },
      relations: ['mentor'],
    });
  }

  async findOne(id: string) {
    const availability = await this.availabilityRepository.findOne({
      where: { id },
      relations: ['mentor'],
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    return availability;
  }

  async update(id: string, updateAvailabilityDto: CreateAvailabilityDto, mentor: User) {
    const availability = await this.findOne(id);

    if (availability.mentor.id !== mentor.id) {
      throw new ForbiddenException('You can only update your own availability slots');
    }

    Object.assign(availability, updateAvailabilityDto);
    return this.availabilityRepository.save(availability);
  }

  async remove(id: string, mentor: User) {
    const availability = await this.findOne(id);

    if (availability.mentor.id !== mentor.id) {
      throw new ForbiddenException('You can only delete your own availability slots');
    }

    await this.availabilityRepository.remove(availability);
    return { message: 'Availability slot deleted successfully' };
  }
} 