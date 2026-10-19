import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../common/constants/roles.enum';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Controller('tickets/:ticketId/comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('ticketId') ticketId: string,
    @Body() createDto: CreateCommentDto,
    @GetUser() user: { id: string; role: Role },
  ): Promise<CommentResponseDto> {
    return this.commentsService.createComment(ticketId, createDto, user);
  }


  @Get()
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  async findAll(
    @Param('ticketId') ticketId: string,
    @GetUser() user: { id: string; role: Role },
  ): Promise<CommentResponseDto[]> {
    return this.commentsService.getCommentsByTicket(ticketId, user);
  }

  @Patch(':commentId')
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  async update(
    @Param('ticketId') ticketId: string,
    @Param('commentId') commentId: string,
    @Body() updateDto: UpdateCommentDto,
    @GetUser() user: { id: string; role: Role },
  ): Promise<CommentResponseDto> {
    return this.commentsService.updateComment(
      ticketId,
      commentId,
      updateDto,
      user,
    );
  }

  @Delete(':commentId')
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  async remove(
    @Param('ticketId') ticketId: string,
    @Param('commentId') commentId: string,
    @GetUser() user: { id: string; role: Role },
  ): Promise<{ success: boolean; message: string; commentId: string }> {
    return this.commentsService.deleteComment(ticketId, commentId, user);
  }
}
