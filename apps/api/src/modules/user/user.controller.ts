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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createDto: CreateUserDto) {
    return this.userService.create(createDto);
  }

  @Get('menu-options')
  getMenuOptions(
    @Query('role') roleQuery?: string,
    @CurrentUserId() currentUserId?: string,
  ) {
    return this.userService.getMenuPermissions(roleQuery, currentUserId);
  }

  @Get('validate-menu-access')
  validateMenuAccess(
    @Query('role') role: string,
    @Query('menu') menu: string,
  ) {
    const isGranted = UserService.validateMenuAccessByRole(role, menu);
    return { role, menu, isGranted };
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}
