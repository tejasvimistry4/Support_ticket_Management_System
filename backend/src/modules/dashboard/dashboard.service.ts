import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Role } from '../../common/constants/roles.enum';
import { TicketPriority } from '../../common/constants/ticket-priority';
import { TicketStatus } from '../../common/constants/ticket-status';
import { PrismaService } from '../../database/prisma.service';
import {
  calculateResolutionDuration,
  formatDateKey,
  formatDateLabel,
  formatDuration,
  getDateRangeBounds,
  getPriorityColor,
  getStatusColor,
  getSlaHours,
  getWeekNumber,
  isTicketOverdue,
} from '../../helpers';
import {
  AgentWorkloadDto,
  DashboardAnalyticsDto,
  PriorityDistributionDto,
  ResolvedVsUnresolvedDto,
  StatusDistributionDto,
  TicketsOverTimeDto,
} from './dto/dashboard-analytics.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(
    currentUser: { id: string; role: Role },
  ): Promise<DashboardStatsDto> {
    const baseWhere: Prisma.TicketWhereInput = {};

    if (currentUser.role === Role.SUPPORT_AGENT) {
      baseWhere.assignedToId = currentUser.id;
    } else if (currentUser.role === Role.ADMIN) {
      baseWhere.createdById = currentUser.id;
    }

    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      low,
      medium,
      high,
      urgent,
      unassigned,
    ] = await this.prisma.$transaction([
      this.prisma.ticket.count({ where: baseWhere }),
      this.prisma.ticket.count({
        where: { ...baseWhere, status: TicketStatus.OPEN },
      }),
      this.prisma.ticket.count({
        where: { ...baseWhere, status: TicketStatus.IN_PROGRESS },
      }),
      this.prisma.ticket.count({
        where: { ...baseWhere, status: TicketStatus.RESOLVED },
      }),
      this.prisma.ticket.count({
        where: { ...baseWhere, status: TicketStatus.CLOSED },
      }),
      this.prisma.ticket.count({
        where: { ...baseWhere, priority: TicketPriority.LOW },
      }),
      this.prisma.ticket.count({
        where: { ...baseWhere, priority: TicketPriority.MEDIUM },
      }),
      this.prisma.ticket.count({
        where: { ...baseWhere, priority: TicketPriority.HIGH },
      }),
      this.prisma.ticket.count({
        where: { ...baseWhere, priority: TicketPriority.URGENT },
      }),
      this.prisma.ticket.count({
        where: { ...baseWhere, assignedToId: null },
      }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      low,
      medium,
      high,
      urgent,
      unassigned,
    };
  }

  async getAnalytics(
    query: QueryAnalyticsDto,
    currentUser: { id: string; role: Role },
  ): Promise<DashboardAnalyticsDto> {
    const now = new Date();

    const { startDate, endDate } = getDateRangeBounds(
      query.timeRange || '7d',
      query.startDate,
      query.endDate,
      now,
    );

    const groupBy = query.groupBy || 'day';

    const baseWhere: Prisma.TicketWhereInput = {};
    if (currentUser.role === Role.SUPPORT_AGENT) {
      baseWhere.assignedToId = currentUser.id;
    } else if (currentUser.role === Role.ADMIN) {
      baseWhere.createdById = currentUser.id;
      if (query.agentId) {
        baseWhere.assignedToId =
          query.agentId === 'unassigned' ? null : query.agentId;
      }
    }

    const [allTickets, supportAgents] = await Promise.all([
      this.prisma.ticket.findMany({
        where: baseWhere,
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          resolvedAt: true,
          dueDate: true,
          assignedToId: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      currentUser.role === Role.ADMIN
        ? this.prisma.user.findMany({
            where: { role: Role.SUPPORT_AGENT },
            select: { id: true, name: true, email: true },
            orderBy: { name: 'asc' },
          })
        : [],
    ]);

    let openCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let closedCount = 0;
    let lowCount = 0;
    let mediumCount = 0;
    let highCount = 0;
    let urgentCount = 0;
    let unassignedCount = 0;
    let overdueCount = 0;

    let totalResolutionDurationMillis = 0;
    let resolvedWithDurationCount = 0;
    let onTimeResolutionsCount = 0;
    let breachedResolutionsCount = 0;

    for (const ticket of allTickets) {
      if (ticket.status === TicketStatus.OPEN) openCount++;
      else if (ticket.status === TicketStatus.IN_PROGRESS) inProgressCount++;
      else if (ticket.status === TicketStatus.RESOLVED) resolvedCount++;
      else if (ticket.status === TicketStatus.CLOSED) closedCount++;

      if (ticket.priority === TicketPriority.LOW) lowCount++;
      else if (ticket.priority === TicketPriority.MEDIUM) mediumCount++;
      else if (ticket.priority === TicketPriority.HIGH) highCount++;
      else if (ticket.priority === TicketPriority.URGENT) urgentCount++;

      if (!ticket.assignedToId) unassignedCount++;

      const isResolved =
        ticket.status === TicketStatus.RESOLVED ||
        ticket.status === TicketStatus.CLOSED;

      if (!isResolved) {
        if (isTicketOverdue(ticket, now)) {
          overdueCount++;
        }
      } else {
        const duration = calculateResolutionDuration(
          ticket.createdAt,
          ticket.resolvedAt,
          ticket.updatedAt,
        );

        if (duration > 0) {
          totalResolutionDurationMillis += duration;
          resolvedWithDurationCount++;

          const slaTargetMillis = getSlaHours(ticket.priority) * 60 * 60 * 1000;
          if (duration <= slaTargetMillis) {
            onTimeResolutionsCount++;
          } else {
            breachedResolutionsCount++;
          }
        }
      }
    }

    const totalTickets = allTickets.length;
    const totalResolved = resolvedCount + closedCount;
    const totalUnresolved = openCount + inProgressCount;
    const resolutionRate =
      totalTickets > 0
        ? Number(((totalResolved / totalTickets) * 100).toFixed(1))
        : 0;

    const avgResolutionHours =
      resolvedWithDurationCount > 0
        ? Number(
            (
              totalResolutionDurationMillis /
              resolvedWithDurationCount /
              (1000 * 60 * 60)
            ).toFixed(1),
          )
        : 0;

    const avgResolutionFormatted = formatDuration(avgResolutionHours);

    const ticketsOverTime: TicketsOverTimeDto[] = [];

    if (groupBy === 'week') {
      const weekBuckets: Map<
        string,
        { label: string; date: string; created: number; resolved: number }
      > = new Map();

      const cursor = new Date(startDate);
      cursor.setHours(0, 0, 0, 0);
      while (cursor <= endDate) {
        const { year, week, label } = getWeekNumber(cursor);
        const key = `${year}-${String(week).padStart(2, '0')}`;
        if (!weekBuckets.has(key)) {
          weekBuckets.set(key, {
            date: formatDateKey(cursor),
            label,
            created: 0,
            resolved: 0,
          });
        }
        cursor.setDate(cursor.getDate() + 7);
      }

      for (const ticket of allTickets) {
        if (ticket.createdAt >= startDate && ticket.createdAt <= endDate) {
          const { year, week } = getWeekNumber(ticket.createdAt);
          const key = `${year}-${String(week).padStart(2, '0')}`;
          const b = weekBuckets.get(key);
          if (b) b.created++;
        }
        const resolvedDate =
          ticket.resolvedAt ||
          (ticket.status === TicketStatus.RESOLVED ||
          ticket.status === TicketStatus.CLOSED
            ? ticket.updatedAt
            : null);
        if (
          resolvedDate &&
          resolvedDate >= startDate &&
          resolvedDate <= endDate
        ) {
          const { year, week } = getWeekNumber(resolvedDate);
          const key = `${year}-${String(week).padStart(2, '0')}`;
          const b = weekBuckets.get(key);
          if (b) b.resolved++;
        }
      }

      for (const b of weekBuckets.values()) {
        ticketsOverTime.push(b);
      }
    } else {
      const dayBuckets: Map<
        string,
        { label: string; date: string; created: number; resolved: number }
      > = new Map();

      const cursor = new Date(startDate);
      cursor.setHours(0, 0, 0, 0);
      while (cursor <= endDate) {
        const key = formatDateKey(cursor);
        dayBuckets.set(key, {
          date: key,
          label: formatDateLabel(cursor),
          created: 0,
          resolved: 0,
        });
        cursor.setDate(cursor.getDate() + 1);
      }

      for (const ticket of allTickets) {
        if (ticket.createdAt >= startDate && ticket.createdAt <= endDate) {
          const key = formatDateKey(ticket.createdAt);
          const b = dayBuckets.get(key);
          if (b) b.created++;
        }
        const resolvedDate =
          ticket.resolvedAt ||
          (ticket.status === TicketStatus.RESOLVED ||
          ticket.status === TicketStatus.CLOSED
            ? ticket.updatedAt
            : null);
        if (
          resolvedDate &&
          resolvedDate >= startDate &&
          resolvedDate <= endDate
        ) {
          const key = formatDateKey(resolvedDate);
          const b = dayBuckets.get(key);
          if (b) b.resolved++;
        }
      }

      for (const b of dayBuckets.values()) {
        ticketsOverTime.push(b);
      }
    }

    const priorityDistribution: PriorityDistributionDto[] = [
      {
        priority: TicketPriority.LOW,
        label: 'Low',
        count: lowCount,
        percentage:
          totalTickets > 0
            ? Number(((lowCount / totalTickets) * 100).toFixed(1))
            : 0,
        color: getPriorityColor(TicketPriority.LOW),
      },
      {
        priority: TicketPriority.MEDIUM,
        label: 'Medium',
        count: mediumCount,
        percentage:
          totalTickets > 0
            ? Number(((mediumCount / totalTickets) * 100).toFixed(1))
            : 0,
        color: getPriorityColor(TicketPriority.MEDIUM),
      },
      {
        priority: TicketPriority.HIGH,
        label: 'High',
        count: highCount,
        percentage:
          totalTickets > 0
            ? Number(((highCount / totalTickets) * 100).toFixed(1))
            : 0,
        color: getPriorityColor(TicketPriority.HIGH),
      },
      {
        priority: TicketPriority.URGENT,
        label: 'Urgent',
        count: urgentCount,
        percentage:
          totalTickets > 0
            ? Number(((urgentCount / totalTickets) * 100).toFixed(1))
            : 0,
        color: getPriorityColor(TicketPriority.URGENT),
      },
    ];

    const statusDistribution: StatusDistributionDto[] = [
      {
        status: TicketStatus.OPEN,
        label: 'Open',
        count: openCount,
        percentage:
          totalTickets > 0
            ? Number(((openCount / totalTickets) * 100).toFixed(1))
            : 0,
        color: getStatusColor(TicketStatus.OPEN),
      },
      {
        status: TicketStatus.IN_PROGRESS,
        label: 'In Progress',
        count: inProgressCount,
        percentage:
          totalTickets > 0
            ? Number(((inProgressCount / totalTickets) * 100).toFixed(1))
            : 0,
        color: getStatusColor(TicketStatus.IN_PROGRESS),
      },
      {
        status: TicketStatus.RESOLVED,
        label: 'Resolved',
        count: resolvedCount,
        percentage:
          totalTickets > 0
            ? Number(((resolvedCount / totalTickets) * 100).toFixed(1))
            : 0,
        color: getStatusColor(TicketStatus.RESOLVED),
      },
      {
        status: TicketStatus.CLOSED,
        label: 'Closed',
        count: closedCount,
        percentage:
          totalTickets > 0
            ? Number(((closedCount / totalTickets) * 100).toFixed(1))
            : 0,
        color: getStatusColor(TicketStatus.CLOSED),
      },
    ];

    const resolvedVsUnresolved: ResolvedVsUnresolvedDto[] = [
      {
        name: 'Resolved',
        count: totalResolved,
        percentage: resolutionRate,
        color: getStatusColor(TicketStatus.RESOLVED),
      },
      {
        name: 'Unresolved',
        count: totalUnresolved,
        percentage:
          totalTickets > 0
            ? Number(((totalUnresolved / totalTickets) * 100).toFixed(1))
            : 0,
        color: getStatusColor(TicketStatus.OPEN),
      },
    ];

    const agentMap: Map<string, AgentWorkloadDto> = new Map();

    if (currentUser.role === Role.ADMIN) {
      for (const agent of supportAgents) {
        agentMap.set(agent.id, {
          agentId: agent.id,
          agentName: agent.name,
          agentEmail: agent.email,
          totalAssigned: 0,
          openCount: 0,
          inProgressCount: 0,
          resolvedCount: 0,
          closedCount: 0,
          overdueCount: 0,
          avgResolutionHours: 0,
        });
      }

      if (unassignedCount > 0) {
        agentMap.set('unassigned', {
          agentId: 'unassigned',
          agentName: 'Unassigned',
          agentEmail: 'none',
          totalAssigned: 0,
          openCount: 0,
          inProgressCount: 0,
          resolvedCount: 0,
          closedCount: 0,
          overdueCount: 0,
          avgResolutionHours: 0,
        });
      }
    } else {
      agentMap.set(currentUser.id, {
        agentId: currentUser.id,
        agentName: 'You',
        agentEmail: '',
        totalAssigned: 0,
        openCount: 0,
        inProgressCount: 0,
        resolvedCount: 0,
        closedCount: 0,
        overdueCount: 0,
        avgResolutionHours: 0,
      });
    }
    const agentResTimes: Map<string, { totalMillis: number; count: number }> =
      new Map();

    for (const ticket of allTickets) {
      const targetAgentId =
        ticket.assignedToId ||
        (currentUser.role === Role.ADMIN ? 'unassigned' : currentUser.id);
      let agentStat = agentMap.get(targetAgentId);

      if (!agentStat && currentUser.role === Role.ADMIN && ticket.assignedTo) {
        agentStat = {
          agentId: ticket.assignedTo.id,
          agentName: ticket.assignedTo.name,
          agentEmail: ticket.assignedTo.email,
          totalAssigned: 0,
          openCount: 0,
          inProgressCount: 0,
          resolvedCount: 0,
          closedCount: 0,
          overdueCount: 0,
          avgResolutionHours: 0,
        };
        agentMap.set(targetAgentId, agentStat);
      }

      if (agentStat) {
        agentStat.totalAssigned++;
        if (ticket.status === TicketStatus.OPEN) agentStat.openCount++;
        else if (ticket.status === TicketStatus.IN_PROGRESS)
          agentStat.inProgressCount++;
        else if (ticket.status === TicketStatus.RESOLVED)
          agentStat.resolvedCount++;
        else if (ticket.status === TicketStatus.CLOSED) agentStat.closedCount++;

        const isResolved =
          ticket.status === TicketStatus.RESOLVED ||
          ticket.status === TicketStatus.CLOSED;

        if (!isResolved) {
          if (isTicketOverdue(ticket, now)) {
            agentStat.overdueCount++;
          }
        } else {
          const duration = calculateResolutionDuration(
            ticket.createdAt,
            ticket.resolvedAt,
            ticket.updatedAt,
          );
          if (duration > 0) {
            const currentRes = agentResTimes.get(targetAgentId) || {
              totalMillis: 0,
              count: 0,
            };
            currentRes.totalMillis += duration;
            currentRes.count++;
            agentResTimes.set(targetAgentId, currentRes);
          }
        }
      }
    }

    for (const [id, res] of agentResTimes.entries()) {
      const agent = agentMap.get(id);
      if (agent && res.count > 0) {
        agent.avgResolutionHours = Number(
          (res.totalMillis / res.count / (1000 * 60 * 60)).toFixed(1),
        );
      }
    }

    const agentWorkload = Array.from(agentMap.values()).sort(
      (a, b) => b.totalAssigned - a.totalAssigned,
    );

    const totalSlaCalculated =
      onTimeResolutionsCount + breachedResolutionsCount;
    const complianceRate =
      totalSlaCalculated > 0
        ? Number(
            ((onTimeResolutionsCount / totalSlaCalculated) * 100).toFixed(1),
          )
        : 100;

    const recentActivity: Array<{
      id: string;
      type: 'COMMENT' | 'STATUS_CHANGE' | 'ASSIGNED';
      ticketId: string;
      ticketTitle: string;
      ticketStatus: TicketStatus;
      ticketPriority: TicketPriority;
      actorName: string;
      actorEmail?: string;
      message: string;
      createdAt: string;
    }> = [];

    try {
      if (
        this.prisma.comment &&
        typeof this.prisma.comment.findMany === 'function'
      ) {
        const commentWhere: Prisma.CommentWhereInput = {};
        if (currentUser.role === Role.SUPPORT_AGENT) {
          commentWhere.ticket = { assignedToId: currentUser.id };
        } else if (currentUser.role === Role.ADMIN) {
          commentWhere.ticket = { createdById: currentUser.id };
        }

        const comments = await this.prisma.comment.findMany({
          where: commentWhere,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: { id: true, name: true, email: true },
            },
            ticket: {
              select: { id: true, title: true, status: true, priority: true },
            },
          },
        });

        for (const c of comments) {
          recentActivity.push({
            id: `comment-${c.id}`,
            type: 'COMMENT',
            ticketId: c.ticket.id,
            ticketTitle: c.ticket.title,
            ticketStatus: c.ticket.status,
            ticketPriority: c.ticket.priority,
            actorName: c.author.name,
            actorEmail: c.author.email,
            message: c.content,
            createdAt: c.createdAt.toISOString(),
          });
        }
      }
    } catch {
     
    }

    for (const ticket of allTickets.slice(-8).reverse()) {
      if (
        ticket.status === TicketStatus.RESOLVED ||
        ticket.status === TicketStatus.CLOSED ||
        ticket.status === TicketStatus.IN_PROGRESS
      ) {
        recentActivity.push({
          id: `status-${ticket.id}`,
          type: 'STATUS_CHANGE',
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          ticketStatus: ticket.status,
          ticketPriority: ticket.priority,
          actorName:
            currentUser.role === Role.SUPPORT_AGENT
              ? 'You'
              : ticket.assignedTo?.name || 'Agent',
          actorEmail: ticket.assignedTo?.email,
          message: 'You updated a ticket status',
          createdAt: (
            ticket.resolvedAt ||
            ticket.updatedAt ||
            ticket.createdAt
          ).toISOString(),
        });
      }

      recentActivity.push({
        id: `assigned-${ticket.id}`,
        type: 'ASSIGNED',
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        ticketStatus: ticket.status,
        ticketPriority: ticket.priority,
        actorName: ticket.createdBy?.name || 'System Admin',
        actorEmail: ticket.createdBy?.email,
        message: 'A new ticket was assigned to you',
        createdAt: ticket.createdAt.toISOString(),
      });
    }

    recentActivity.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      summary: {
        total: totalTickets,
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        closed: closedCount,
        totalResolved,
        totalUnresolved,
        resolutionRate,
        averageResolutionTimeHours: avgResolutionHours,
        averageResolutionTimeFormatted: avgResolutionFormatted,
        overdueCount,
        low: lowCount,
        medium: mediumCount,
        high: highCount,
        urgent: urgentCount,
        unassigned: unassignedCount,
      },
      ticketsOverTime,
      priorityDistribution,
      statusDistribution,
      resolvedVsUnresolved,
      agentWorkload,
      slaMetrics: {
        slaCompliantCount: onTimeResolutionsCount,
        slaBreachedCount: breachedResolutionsCount,
        complianceRate,
      },
      recentActivity: recentActivity.slice(0, 10),
      dateRange: {
        startDate: formatDateKey(startDate),
        endDate: formatDateKey(endDate),
        timeRange: query.timeRange || '7d',
        groupBy,
      },
    };
  }
}
