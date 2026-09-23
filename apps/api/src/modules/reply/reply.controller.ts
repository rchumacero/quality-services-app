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

@Controller('replies')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post()
  create(@Body() createDto: CreateReplyDto) {
    return this.replyService.create(createDto);
  }

  @Get()
  findAll(@Query() query: ReplyFilterQueryDto) {
    return this.replyService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.replyService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateReplyDto,
  ) {
    return this.replyService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.replyService.remove(id);
  }
}
