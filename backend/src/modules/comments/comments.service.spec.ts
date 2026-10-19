import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '../../common/constants/roles.enum';
import { PrismaService } from '../../database/prisma.service';
import { CommentsGateway } from './comments.gateway';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockPrismaService = {
    ticket: {
      findUnique: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCommentsGateway = {
    broadcastNewComment: jest.fn(),
    broadcastUpdatedComment: jest.fn(),
    broadcastDeletedComment: jest.fn(),
  };

  const mockAdminUser = {
    id: 'admin-1',
    role: Role.ADMIN,
  };

  const mockAgentUser = {
    id: 'agent-1',
    role: Role.SUPPORT_AGENT,
  };

  const mockOtherAgentUser = {
    id: 'agent-2',
    role: Role.SUPPORT_AGENT,
  };

  const mockTicket = {
    id: 'ticket-1',
    title: 'Test Ticket',
    description: 'Ticket description',
    assignedToId: 'agent-1',
    createdById: 'admin-1',
  };

  const mockComment = {
    id: 'comment-1',
    content: 'Investigation in progress',
    ticketId: 'ticket-1',
    authorId: 'agent-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 'agent-1',
      name: 'Alex Agent',
      email: 'agent@gmail.com',
      role: Role.SUPPORT_AGENT,
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CommentsGateway,
          useValue: mockCommentsGateway,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  describe('canUserAccessTicket', () => {
    it('should return true for ADMIN role', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        createdById: 'admin-1',
        assignedToId: 'agent-1',
      });

      const result = await service.canUserAccessTicket(
        'admin-1',
        Role.ADMIN,
        'ticket-1',
      );
      expect(result).toBe(true);
    });

    it('should return true for SUPPORT_AGENT even when ticket assigned agent changes', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        assignedToId: 'other-agent',
      });

      const result = await service.canUserAccessTicket(
        'agent-1',
        Role.SUPPORT_AGENT,
        'ticket-1',
      );
      expect(result).toBe(true);
    });

    it('should return false if ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      const result = await service.canUserAccessTicket(
        'agent-1',
        Role.SUPPORT_AGENT,
        'non-existent-ticket',
      );
      expect(result).toBe(false);
    });
  });

  describe('createComment', () => {
    it('should allow ADMIN to post a comment and broadcast via gateway', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.createComment(
        'ticket-1',
        { content: 'Investigation in progress' },
        mockAdminUser,
      );

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.comment.create).toHaveBeenCalled();
      expect(mockCommentsGateway.broadcastNewComment).toHaveBeenCalledWith(
        'ticket-1',
        mockComment,
      );
    });

    it('should allow assigned SUPPORT_AGENT to post a comment', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.createComment(
        'ticket-1',
        { content: 'Working on patch' },
        mockAgentUser,
      );

      expect(result).toEqual(mockComment);
      expect(mockCommentsGateway.broadcastNewComment).toHaveBeenCalled();
    });

    it('should allow SUPPORT_AGENT to post a comment even when assigned agent changes', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.createComment(
        'ticket-1',
        { content: 'New agent updating on handover' },
        mockOtherAgentUser,
      );

      expect(result).toEqual(mockComment);
      expect(mockCommentsGateway.broadcastNewComment).toHaveBeenCalled();
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment(
          'non-existent',
          { content: 'Hello' },
          mockAdminUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCommentsByTicket', () => {
    it('should return list of comments for accessible ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.getCommentsByTicket('ticket-1', mockAgentUser);

      expect(result).toEqual([mockComment]);
      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: { ticketId: 'ticket-1' },
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    });

    it('should allow another agent to retrieve comments so discussion history is preserved', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.getCommentsByTicket('ticket-1', mockOtherAgentUser);
      expect(result).toEqual([mockComment]);
    });
  });

  describe('updateComment', () => {
    it('should allow author to update their comment and broadcast via gateway', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      const updatedComment = {
        ...mockComment,
        content: 'Updated content by author',
      };
      mockPrismaService.comment.update.mockResolvedValue(updatedComment);

      const result = await service.updateComment(
        'ticket-1',
        'comment-1',
        { content: 'Updated content by author' },
        mockAgentUser,
      );

      expect(result.content).toBe('Updated content by author');
      expect(mockCommentsGateway.broadcastUpdatedComment).toHaveBeenCalledWith(
        'ticket-1',
        updatedComment,
      );
    });

    it('should forbid non-author ADMIN from updating someone else comment', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.updateComment(
          'ticket-1',
          'comment-1',
          { content: 'Admin modified this comment' },
          mockAdminUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid non-author agent from updating comment', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        ...mockTicket,
        assignedToId: 'agent-2',
      });
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.updateComment(
          'ticket-1',
          'comment-1',
          { content: 'Attempted edit' },
          mockOtherAgentUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteComment', () => {
    it('should allow author to delete their comment and broadcast via gateway', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      const result = await service.deleteComment(
        'ticket-1',
        'comment-1',
        mockAgentUser,
      );

      expect(result.success).toBe(true);
      expect(result.commentId).toBe('comment-1');
      expect(mockCommentsGateway.broadcastDeletedComment).toHaveBeenCalledWith(
        'ticket-1',
        'comment-1',
      );
    });

    it('should forbid non-author ADMIN from deleting someone else comment', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.deleteComment(
          'ticket-1',
          'comment-1',
          mockAdminUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid non-author agent from deleting comment', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        ...mockTicket,
        assignedToId: 'agent-2',
      });
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(
        service.deleteComment('ticket-1', 'comment-1', mockOtherAgentUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
