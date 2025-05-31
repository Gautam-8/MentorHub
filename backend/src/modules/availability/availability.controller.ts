import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

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

  @Get()
  findAll() {
    return this.availabilityService.findAll();
  }

  @Get('mentor/:mentorId')
  findByMentor(@Param('mentorId') mentorId: string) {
    return this.availabilityService.findByMentor(mentorId);
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
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    @Request() req,
  ) {
    return this.availabilityService.update(id, updateAvailabilityDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  remove(@Param('id') id: string) {
    return this.availabilityService.remove(id);
  }
} 