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
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateUser,
  ApiFindAllUsers,
  ApiFindOneUser,
  ApiRemoveUser,
  ApiUpdateUser,
} from './decorators/users-swagger.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  type UserRecord,
  type UsersListResponse,
  UsersService,
} from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users -> yeni kullanıcı oluşturur.
  @ApiCreateUser()
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserRecord> {
    return this.usersService.create(createUserDto);
  }

  // GET /users -> tüm kullanıcıları listeler.
  @ApiFindAllUsers()
  @Get()
  findAll(@Query() query: ListUsersQueryDto): Promise<UsersListResponse> {
    return this.usersService.findAll(query);
  }

  // GET /users/:id -> tek kullanıcı detayını getirir.
  @ApiFindOneUser()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserRecord> {
    return this.usersService.findOne(id);
  }

  // PATCH /users/:id -> kullanıcıda kısmi güncelleme yapar.
  @ApiUpdateUser()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserRecord> {
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE /users/:id -> kullanıcıyı siler.
  @ApiRemoveUser()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<UserRecord> {
    return this.usersService.remove(id);
  }
}
