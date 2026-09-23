import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BrandUserService, BrandUserFilterQueryDto } from './brand-user.service';
import { CreateBrandUserDto } from './dto/create-brand-user.dto';
import { UpdateBrandUserDto } from './dto/update-brand-user.dto';

@Controller('brand-users')
export class BrandUserController {
  constructor(private readonly brandUserService: BrandUserService) {}

  @Post()
  create(@Body() createDto: CreateBrandUserDto) {
    return this.brandUserService.create(createDto);
  }

  @Get()
  findAll(@Query() query: BrandUserFilterQueryDto) {
    return this.brandUserService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandUserService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBrandUserDto,
  ) {
    return this.brandUserService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandUserService.remove(id);
  }
}
