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
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiCreatePost,
  ApiFindAllPosts,
  ApiFindOnePost,
  ApiRemovePost,
  ApiUpdatePost,
} from './decorators/posts-swagger.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  type PostRecord,
  type PostsListResponse,
  PostsService,
} from './posts.service';

@ApiTags('posts')
@Roles(Role.ADMIN)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiCreatePost()
  @Post()
  create(@Body() createPostDto: CreatePostDto): Promise<PostRecord> {
    return this.postsService.create(createPostDto);
  }

  @ApiFindAllPosts()
  @Get()
  findAll(@Query() query: ListPostsQueryDto): Promise<PostsListResponse> {
    return this.postsService.findAll(query);
  }

  @ApiFindOnePost()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<PostRecord> {
    return this.postsService.findOne(id);
  }

  @ApiUpdatePost()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostRecord> {
    return this.postsService.update(id, updatePostDto);
  }

  @ApiRemovePost()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<PostRecord> {
    return this.postsService.remove(id);
  }
}
