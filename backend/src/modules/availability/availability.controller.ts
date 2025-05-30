import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  create(@Body() createAvailabilityDto: CreateAvailabilityDto, @Request() req) {
    return this.availabilityService.create(createAvailabilityDto, req.user);
  }

  @Get('mentor/:mentorId')
  findAllByMentor(@Param('mentorId') mentorId: string) {
    return this.availabilityService.findAllByMentor(mentorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.availabilityService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  update(
    @Param('id') id: string,
    @Body() updateAvailabilityDto: CreateAvailabilityDto,
    @Request() req,
  ) {
    return this.availabilityService.update(id, updateAvailabilityDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  remove(@Param('id') id: string, @Request() req) {
    return this.availabilityService.remove(id, req.user);
  }
} 