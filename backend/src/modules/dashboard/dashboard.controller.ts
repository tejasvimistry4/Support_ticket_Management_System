import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '../../common/constants/roles.enum';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { DashboardAnalyticsDto } from './dto/dashboard-analytics.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  async getStats(
    @GetUser() user: { id: string; role: Role },
  ): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats(user);
  }

  @Get('analytics')
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  async getAnalytics(
    @Query() query: QueryAnalyticsDto,
    @GetUser() user: { id: string; role: Role },
  ): Promise<DashboardAnalyticsDto> {
    return this.dashboardService.getAnalytics(query, user);
  }

  @Get('summary')
  @Roles(Role.ADMIN, Role.SUPPORT_AGENT)
  async getSummary(
    @Query() query: QueryAnalyticsDto,
    @GetUser() user: { id: string; role: Role },
  ): Promise<DashboardAnalyticsDto> {
    return this.dashboardService.getAnalytics(query, user);
  }
}
