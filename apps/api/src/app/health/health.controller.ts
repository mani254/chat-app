import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database-health.indicator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Public()
@Controller({ path: 'health', version: [VERSION_NEUTRAL, '1'] })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DatabaseHealthIndicator,
  ) {}

  /**
   * GET /api/v1/health & GET /api/health
   *
   * Returns API status and MongoDB connection state without requiring authentication.
   */
  @Get()
  @HealthCheck()
  @ApiOkResponse({ description: 'Service is healthy' })
  check() {
    return this.health.check([() => this.db.isHealthy('database')]);
  }
}
