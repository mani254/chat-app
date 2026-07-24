import { registerAs } from '@nestjs/config';
import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  validateSync,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

class RedisEnv {
  @IsOptional()
  @IsString()
  REDIS_HOST?: string = 'localhost';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT?: number = 6379;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(15)
  REDIS_DB?: number = 0;
}

function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(RedisEnv, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Redis config validation failed:\n${errors.toString()}`);
  }
  return validated;
}

export default registerAs('redis', () => {
  const env = validate(process.env as Record<string, unknown>);
  return {
    host: env.REDIS_HOST ?? 'localhost',
    port: env.REDIS_PORT ?? 6379,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB ?? 0,
  };
});
