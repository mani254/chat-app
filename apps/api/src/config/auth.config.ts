import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsOptional, IsString, validateSync } from 'class-validator';

class AuthEnv {
  @IsOptional()
  @IsString()
  BETTER_AUTH_SECRET?: string;

  @IsString()
  BETTER_AUTH_URL: string = 'http://localhost:8080';

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;
}

function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(AuthEnv, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Auth config validation failed:\n${errors.toString()}`);
  }
  return validated;
}

export default registerAs('auth', () => {
  const env = validate(process.env as Record<string, unknown>);
  return {
    secret: env.BETTER_AUTH_SECRET,
    url: env.BETTER_AUTH_URL,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
  };
});
