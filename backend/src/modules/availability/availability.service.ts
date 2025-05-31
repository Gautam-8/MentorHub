import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability, DayOfWeek } from './entities/availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilityDto, user: User) {
    const availability = this.availabilityRepository.create({
      date: new Date(createAvailabilityDto.date),
      dayOfWeek: createAvailabilityDto.dayOfWeek as DayOfWeek,
      startTime: createAvailabilityDto.startTime,
      endTime: createAvailabilityDto.endTime,
      mentor: user,
    });

    return this.availabilityRepository.save(availability);
  }

  async findAll(startDate?: string, endDate?: string) {
    const query = this.availabilityRepository
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.mentor', 'mentor');

    if (startDate && endDate) {
      query.where('availability.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return query.getMany();
  }

  async findByMentor(mentorId: string) {
    return this.availabilityRepository.find({
      where: { mentor: { id: mentorId } },
      relations: ['mentor'],
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
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

  async update(id: string, updateAvailabilityDto: UpdateAvailabilityDto, user: User) {
    const availability = await this.findOne(id);

    if (availability.mentor.id !== user.id) {
      throw new ForbiddenException('You can only update your own availability slots');
    }

    const updatedData: Partial<Availability> = {};
    if (updateAvailabilityDto.date) {
      updatedData.date = new Date(updateAvailabilityDto.date);
    }
    if (updateAvailabilityDto.dayOfWeek) {
      updatedData.dayOfWeek = updateAvailabilityDto.dayOfWeek;
    }
    if (updateAvailabilityDto.startTime) {
      updatedData.startTime = updateAvailabilityDto.startTime;
    }
    if (updateAvailabilityDto.endTime) {
      updatedData.endTime = updateAvailabilityDto.endTime;
    }

    Object.assign(availability, updatedData);
    return this.availabilityRepository.save(availability);
  }

  async remove(id: string) {
    return this.availabilityRepository.delete(id);
  }
} 