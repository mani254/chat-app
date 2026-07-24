import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database-health.indicator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DatabaseHealthIndicator,
  ) {}

  /**
   * GET /api/v1/health
   *
   * Returns API status and MongoDB connection state.
   */
  @Get()
  @HealthCheck()
  @ApiOkResponse({ description: 'Service is healthy' })
  check() {
    return this.health.check([() => this.db.isHealthy('database')]);
  }
}
