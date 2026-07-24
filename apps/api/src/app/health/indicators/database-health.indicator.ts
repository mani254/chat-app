import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import mongoose from 'mongoose';

/**
 * DatabaseHealthIndicator
 *
 * Checks the Mongoose connection state using the existing @org/dal connection.
 * Does NOT create a new MongoDB connection — it inspects the singleton
 * connection established by connectDatabase() at bootstrap.
 *
 * readyState values:
 *   0 = disconnected
 *   1 = connected  ← healthy
 *   2 = connecting
 *   3 = disconnecting
 */
@Injectable()
export class DatabaseHealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const readyState = mongoose.connection.readyState;
    const isConnected = readyState === 1;

    const result: HealthIndicatorResult = {
      [key]: {
        status: isConnected ? 'up' : 'down',
        readyState,
      },
    };

    if (!isConnected) {
      throw new HealthCheckError('Database is not connected', result);
    }

    return result;
  }
}
