import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryAnalyticsDto {
  @IsOptional()
  @IsIn(['7d', '30d', '90d', 'all'], {
    message: 'timeRange must be one of: 7d, 30d, 90d, all',
  })
  timeRange?: '7d' | '30d' | '90d' | 'all';

  @IsOptional()
  @IsString({ message: 'startDate must be an ISO date string' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: 'endDate must be an ISO date string' })
  endDate?: string;

  @IsOptional()
  @IsIn(['day', 'week'], {
    message: 'groupBy must be either "day" or "week"',
  })
  groupBy?: 'day' | 'week';

  @IsOptional()
  @IsString()
  agentId?: string;
}
