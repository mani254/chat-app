import { registerAs } from '@nestjs/config';
import { IsString, IsInt, Min, Max, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class DatabaseEnv {
  @IsString()
  MONGODB_URI!: string;

  @IsInt()
  @Min(1000)
  @Max(30000)
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: number = 5000;
}

function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(DatabaseEnv, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Database config validation failed:\n${errors.toString()}`);
  }
  return validated;
}

export default registerAs('database', () => {
  const env = validate(process.env as Record<string, unknown>);
  return {
    uri: env.MONGODB_URI,
    serverSelectionTimeoutMs: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  };
});
