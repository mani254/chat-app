import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginRequestDto {
  @ApiProperty({
    description: 'Google OAuth ID token or credential string',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString({ message: 'ID token / credential must be a string' })
  @IsNotEmpty({ message: 'ID token / credential is required' })
  idToken!: string;

  @ApiPropertyOptional({
    description: 'User display name override',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
