import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../database/prisma.service';
import { CommentsService } from '../comments/comments.service';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
@WebSocketGateway({
  namespace: '/comments',
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL || 'http://localhost:5173',
    ],
    credentials: true,
  },
})
export class CommentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CommentsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
  ) { }

  afterInit() {
    this.logger.log('📡 Comments Socket.IO Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      const token =
        client.handshake.auth?.token ||
        (authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : authHeader);

      if (!token) {
        this.logger.warn(`Connection rejected (no token): ${client.id}`);
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        this.logger.warn(`Connection rejected (user not found): ${client.id}`);
        client.disconnect(true);
        return;
      }

      client.data.user = user;
      this.logger.log(
        `Client connected: ${client.id} (User: ${user.email}, Role: ${user.role})`,
      );
    } catch (err: any) {
      this.logger.warn(
        `Connection rejected (invalid token): ${client.id} - ${err.message}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private async getAuthenticatedUser(client: Socket) {
    if (client.data?.user) return client.data.user;
    try {
      const authHeader = client.handshake.headers.authorization;
      const token =
        client.handshake.auth?.token ||
        (authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : authHeader);

      if (token) {
        const payload = this.jwtService.verify(token);
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, name: true, email: true, role: true },
        });
        if (user) {
          client.data.user = user;
          return user;
        }
      }
    } catch (e: any) {
      this.logger.warn(`Error resolving user from token: ${e?.message || String(e)}`);
    }
    return null;
  }

  
  @SubscribeMessage('join_ticket')
  async handleJoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = await this.getAuthenticatedUser(client);
    const ticketId = data?.ticketId || (typeof data === 'string' ? data : null);

    if (!user || !ticketId) {
      this.logger.warn(`Rejected join: user=${!!user}, ticketId=${ticketId}`);
      client.emit('error', { message: 'Invalid ticket join request' });
      return { success: false, error: 'Invalid request' };
    }

    const canAccess = await this.commentsService.canUserAccessTicket(
      user.id,
      user.role,
      ticketId,
    );

    if (!canAccess) {
      this.logger.warn(
        `User ${user.email} denied access to ticket room: ${ticketId}`,
      );
      client.emit('error', {
        message:
          'Access denied: You do not have permission to access comments for this ticket',
      });
      return { success: false, error: 'Forbidden' };
    }

    const roomName = `ticket:${ticketId}`;
    await client.join(roomName);
    this.logger.log(`User ${user.email} joined room ${roomName}`);

    client.emit('joined_ticket', { ticketId, success: true });
    return { success: true, ticketId };
  }

  @SubscribeMessage('leave_ticket')
  async handleLeaveTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const ticketId = data?.ticketId || (typeof data === 'string' ? data : null);
    if (ticketId) {
      const roomName = `ticket:${ticketId}`;
      await client.leave(roomName);
      this.logger.log(`Client ${client.id} left room ${roomName}`);
      client.emit('left_ticket', { ticketId, success: true });
      return { success: true, ticketId };
    }
  }

  @SubscribeMessage('send_comment')
  async handleSendComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = await this.getAuthenticatedUser(client);
    if (!user) {
      client.emit('error', { message: 'Unauthorized WebSocket client' });
      return { success: false, error: 'Unauthorized' };
    }

    const ticketId = data?.ticketId;
    const content = data?.content;

    if (!ticketId || !content || content.trim() === '') {
      client.emit('error', { message: 'Ticket ID and comment content are required' });
      return { success: false, error: 'Invalid payload' };
    }

    try {
      const comment = await this.commentsService.createComment(
        ticketId,
        { content },
        user,
      );

      return { success: true, data: comment };
    } catch (err: any) {
      client.emit('error', { message: err.message || 'Failed to submit comment' });
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = await this.getAuthenticatedUser(client);
    const ticketId = data?.ticketId;
    if (!user || !ticketId) return;

    client.to(`ticket:${ticketId}`).emit('user_typing', {
      ticketId,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      isTyping: Boolean(data?.isTyping),
    });
  }

  @SubscribeMessage('edit_comment')
  async handleEditComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = await this.getAuthenticatedUser(client);
    if (!user) {
      client.emit('error', { message: 'Unauthorized WebSocket client' });
      return { success: false, error: 'Unauthorized' };
    }

    const ticketId = data?.ticketId;
    const commentId = data?.commentId;
    const content = data?.content;

    if (!ticketId || !commentId || !content || content.trim() === '') {
      client.emit('error', {
        message: 'ticketId, commentId, and content are required',
      });
      return { success: false, error: 'Invalid payload' };
    }

    try {
      const comment = await this.commentsService.updateComment(
        ticketId,
        commentId,
        { content },
        user,
      );
      return { success: true, data: comment };
    } catch (err: any) {
      client.emit('error', { message: err.message || 'Failed to edit comment' });
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('delete_comment')
  async handleDeleteComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = await this.getAuthenticatedUser(client);
    if (!user) {
      client.emit('error', { message: 'Unauthorized WebSocket client' });
      return { success: false, error: 'Unauthorized' };
    }

    const ticketId = data?.ticketId;
    const commentId = data?.commentId;

    if (!ticketId || !commentId) {
      client.emit('error', {
        message: 'ticketId and commentId are required',
      });
      return { success: false, error: 'Invalid payload' };
    }

    try {
      const result = await this.commentsService.deleteComment(
        ticketId,
        commentId,
        user,
      );
      return { success: true, data: result };
    } catch (err: any) {
      client.emit('error', { message: err.message || 'Failed to delete comment' });
      return { success: false, error: err.message };
    }
  }

  broadcastNewComment(ticketId: string, comment: CommentResponseDto) {
    const roomName = `ticket:${ticketId}`;
    this.logger.log(`Broadcasting new comment on ${roomName} from ${comment.author.name}`);
    this.server.to(roomName).emit('new_comment', comment);
  }

  broadcastUpdatedComment(ticketId: string, comment: CommentResponseDto) {
    const roomName = `ticket:${ticketId}`;
    this.logger.log(`Broadcasting updated comment on ${roomName}: ${comment.id}`);
    this.server.to(roomName).emit('comment_updated', comment);
  }

  broadcastDeletedComment(ticketId: string, commentId: string) {
    const roomName = `ticket:${ticketId}`;
    this.logger.log(`Broadcasting deleted comment on ${roomName}: ${commentId}`);
    this.server.to(roomName).emit('comment_deleted', { ticketId, commentId });
  }
}
