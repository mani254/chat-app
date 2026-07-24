import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsIn, IsInt, IsString, Max, Min, validateSync } from 'class-validator';

class AppEnv {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: 'development' | 'production' | 'test' = 'development';

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 8080;

  @IsString()
  API_PREFIX: string = 'api';

  @IsString()
  API_DEFAULT_VERSION: string = '1';

  @IsString()
  CORS_ORIGIN: string = '*';
}

function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(AppEnv, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`App config validation failed:\n${errors.toString()}`);
  }
  return validated;
}

export default registerAs('app', () => {
  const env = validate(process.env as Record<string, unknown>);
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    apiPrefix: env.API_PREFIX,
    defaultVersion: env.API_DEFAULT_VERSION,
    corsOrigin: env.CORS_ORIGIN,
  };
});
