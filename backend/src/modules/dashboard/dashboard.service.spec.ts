import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../../common/constants/roles.enum';
import { TicketPriority } from '../../common/constants/ticket-priority';
import { TicketStatus } from '../../common/constants/ticket-status';
import { PrismaService } from '../../database/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    ticket: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should calculate stats correctly for ADMIN', async () => {
      mockPrismaService.$transaction.mockResolvedValue([
        10,
        3,
        4,
        2,
        1,
        2,
        4,
        3,
        1,
        2,
      ]);

      const result = await service.getStats({
        id: 'admin-1',
        role: Role.ADMIN,
      });

      expect(result).toEqual({
        total: 10,
        open: 3,
        inProgress: 4,
        resolved: 2,
        closed: 1,
        low: 2,
        medium: 4,
        high: 3,
        urgent: 1,
        unassigned: 2,
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should filter stats by assignedToId for SUPPORT_AGENT', async () => {
      mockPrismaService.$transaction.mockResolvedValue([
        5, 2, 2, 1, 0, 1, 2, 2, 0, 0,
      ]);

      const result = await service.getStats({
        id: 'agent-1',
        role: Role.SUPPORT_AGENT,
      });

      expect(result.total).toBe(5);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('getAnalytics', () => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    const mockTickets = [
      {
        id: 't-1',
        title: 'Open Urgent Ticket',
        priority: TicketPriority.URGENT,
        status: TicketStatus.OPEN,
        createdAt: fiveDaysAgo,
        updatedAt: fiveDaysAgo,
        resolvedAt: null,
        dueDate: null,
        assignedToId: 'agent-1',
        assignedTo: { id: 'agent-1', name: 'Agent One', email: 'agent1@test.com' },
      },
      {
        id: 't-2',
        title: 'Resolved Medium Ticket',
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.RESOLVED,
        createdAt: twoDaysAgo,
        updatedAt: oneDayAgo,
        resolvedAt: oneDayAgo,
        dueDate: null,
        assignedToId: 'agent-1',
        assignedTo: { id: 'agent-1', name: 'Agent One', email: 'agent1@test.com' },
      },
      {
        id: 't-3',
        title: 'Closed High Ticket',
        priority: TicketPriority.HIGH,
        status: TicketStatus.CLOSED,
        createdAt: twoDaysAgo,
        updatedAt: oneDayAgo,
        resolvedAt: oneDayAgo,
        dueDate: null,
        assignedToId: 'agent-2',
        assignedTo: { id: 'agent-2', name: 'Agent Two', email: 'agent2@test.com' },
      },
    ];

    it('should aggregate metrics correctly for ADMIN', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue(mockTickets);
      mockPrismaService.user.findMany.mockResolvedValue([
        { id: 'agent-1', name: 'Agent One', email: 'agent1@test.com' },
        { id: 'agent-2', name: 'Agent Two', email: 'agent2@test.com' },
      ]);

      const analytics = await service.getAnalytics(
        { timeRange: '7d', groupBy: 'day' },
        { id: 'admin-1', role: Role.ADMIN },
      );

      expect(analytics).toBeDefined();
      expect(analytics.summary.total).toBe(3);
      expect(analytics.summary.open).toBe(1);
      expect(analytics.summary.totalResolved).toBe(2);
      expect(analytics.summary.totalUnresolved).toBe(1);
      expect(analytics.summary.overdueCount).toBe(1);
      expect(analytics.summary.resolutionRate).toBeCloseTo(66.7, 1);
      expect(analytics.summary.averageResolutionTimeHours).toBe(24);

      const urgentDist = analytics.priorityDistribution.find(
        (p) => p.priority === TicketPriority.URGENT,
      );
      expect(urgentDist?.count).toBe(1);

      expect(analytics.agentWorkload.length).toBeGreaterThanOrEqual(2);
      const agent1Workload = analytics.agentWorkload.find(
        (a) => a.agentId === 'agent-1',
      );
      expect(agent1Workload?.totalAssigned).toBe(2);
      expect(agent1Workload?.overdueCount).toBe(1);
    });

    it('should scope analytics to current user for SUPPORT_AGENT', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([mockTickets[0], mockTickets[1]]);
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const analytics = await service.getAnalytics(
        { timeRange: '30d' },
        { id: 'agent-1', role: Role.SUPPORT_AGENT },
      );

      expect(analytics.summary.total).toBe(2);
      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assignedToId: 'agent-1' },
        }),
      );
    });
  });
});
