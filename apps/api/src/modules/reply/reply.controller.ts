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
import { ReplyService, ReplyFilterQueryDto } from './reply.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';

@Controller('replies')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post()
  create(
    @Body() createDto: CreateReplyDto,
    @CurrentUserId() userId?: string,
  ) {
    return this.replyService.create(createDto, userId);
  }

  @Get()
  findAll(
    @Query() query: ReplyFilterQueryDto,
    @CurrentUserId() userId?: string,
  ) {
    return this.replyService.findAll(query, userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId?: string,
  ) {
    return this.replyService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateReplyDto,
    @CurrentUserId() userId?: string,
  ) {
    return this.replyService.update(id, updateDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId?: string,
  ) {
    return this.replyService.remove(id, userId);
  }
}
