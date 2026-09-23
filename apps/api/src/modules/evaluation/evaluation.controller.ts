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
import { EvaluationService, EvaluationFilterQueryDto } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';

@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  create(
    @Body() createDto: CreateEvaluationDto,
    @CurrentUserId() userId?: string,
  ) {
    return this.evaluationService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query() query: EvaluationFilterQueryDto,
    @CurrentUserId() userId?: string,
  ) {
    return this.evaluationService.findAll(query, userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId?: string,
  ) {
    return this.evaluationService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEvaluationDto,
    @CurrentUserId() userId?: string,
  ) {
    return this.evaluationService.update(id, updateDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId?: string,
  ) {
    return this.evaluationService.remove(id, userId);
  }
}
