import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import {
  CreateQualityServiceDto,
  ServiceFilterQueryDto,
  UpdateQualityServiceDto,
} from './dto/service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@Query() filters: ServiceFilterQueryDto) {
    return this.servicesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateQualityServiceDto) {
    return this.servicesService.create(createDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateQualityServiceDto,
  ) {
    return this.servicesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
