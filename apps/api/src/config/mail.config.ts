import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

class MailEnv {
  @IsString()
  SMTP_HOST: string = 'smtp-relay.brevo.com';

  @IsInt()
  @Min(1)
  @Max(65535)
  SMTP_PORT: number = 587;

  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @IsOptional()
  @IsString()
  SIB_API_KEY?: string;
}

function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(MailEnv, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Mail config validation failed:\n${errors.toString()}`);
  }
  return validated;
}

export default registerAs('mail', () => {
  const env = validate(process.env as Record<string, unknown>);
  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    apiKey: env.SIB_API_KEY,
  };
});
