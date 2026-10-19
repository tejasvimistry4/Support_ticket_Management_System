import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../common/constants/roles.enum';
import { TicketPriority } from '../../common/constants/ticket-priority';
import { TicketStatus } from '../../common/constants/ticket-status';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../database/prisma.service';

describe('TicketsService', () => {
  let service: TicketsService;

  const mockPrismaService = {
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
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

  const mockSampleTicket = {
    id: 'ticket-1',
    title: 'Test Issue',
    description: 'Detailed description of the issue',
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
    createdById: 'admin-1',
    assignedToId: 'agent-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { id: 'admin-1', name: 'Admin', email: 'admin@gmail.com', role: Role.ADMIN },
    assignedTo: { id: 'agent-1', name: 'Alex Agent', email: 'agent@gmail.com', role: Role.SUPPORT_AGENT },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  describe('create', () => {
    it('should allow ADMIN to create a ticket', async () => {
      mockPrismaService.ticket.create.mockResolvedValue(mockSampleTicket);

      const result = await service.create(
        {
          title: 'Test Issue',
          description: 'Detailed description of the issue',
          priority: TicketPriority.HIGH,
        },
        mockAdminUser,
      );

      expect(result).toEqual(mockSampleTicket);
      expect(mockPrismaService.ticket.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if SUPPORT_AGENT tries to create a ticket', async () => {
      await expect(
        service.create(
          {
            title: 'Test Issue',
            description: 'Detailed description of the issue',
          },
          mockAgentUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should strictly scope query to assignedToId for SUPPORT_AGENT', async () => {
      mockPrismaService.$transaction.mockResolvedValue([1, [mockSampleTicket]]);

      const result = await service.findAll({}, mockAgentUser);

      expect(result.items).toEqual([mockSampleTicket]);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should allow ADMIN to view all tickets', async () => {
      mockPrismaService.$transaction.mockResolvedValue([1, [mockSampleTicket]]);

      const result = await service.findAll({}, mockAdminUser);

      expect(result.items.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should allow assigned agent to view ticket details', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockSampleTicket);

      const result = await service.findOne('ticket-1', mockAgentUser);

      expect(result).toEqual(mockSampleTicket);
    });

    it('should forbid unassigned agent from viewing ticket details', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockSampleTicket);

      await expect(
        service.findOne('ticket-1', mockOtherAgentUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to view any ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockSampleTicket);

      const result = await service.findOne('ticket-1', mockAdminUser);

      expect(result).toEqual(mockSampleTicket);
    });
  });

  describe('update', () => {
    it('should allow assigned SUPPORT_AGENT to update status only', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockSampleTicket);
      const updatedTicket = { ...mockSampleTicket, status: TicketStatus.IN_PROGRESS };
      mockPrismaService.ticket.update.mockResolvedValue(updatedTicket);

      const result = await service.update(
        'ticket-1',
        { status: TicketStatus.IN_PROGRESS },
        mockAgentUser,
      );

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should reject SUPPORT_AGENT attempting to update priority', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockSampleTicket);

      await expect(
        service.update(
          'ticket-1',
          { priority: TicketPriority.URGENT },
          mockAgentUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to update priority, status, and title', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockSampleTicket);
      const updatedTicket = {
        ...mockSampleTicket,
        title: 'Updated Title',
        priority: TicketPriority.URGENT,
      };
      mockPrismaService.ticket.update.mockResolvedValue(updatedTicket);

      const result = await service.update(
        'ticket-1',
        { title: 'Updated Title', priority: TicketPriority.URGENT },
        mockAdminUser,
      );

      expect(result.title).toBe('Updated Title');
      expect(result.priority).toBe(TicketPriority.URGENT);
    });
  });

  describe('remove', () => {
    it('should allow ADMIN to delete a ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockSampleTicket);
      mockPrismaService.ticket.delete.mockResolvedValue(mockSampleTicket);

      const result = await service.remove('ticket-1', mockAdminUser);

      expect(result.success).toBe(true);
    });

    it('should forbid SUPPORT_AGENT from deleting a ticket', async () => {
      await expect(
        service.remove('ticket-1', mockAgentUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
