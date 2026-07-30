import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique MongoDB identifier',
    example: '60d5ecb8b392d511f8b1c411',
  })
  _id!: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email!: string;

  @ApiPropertyOptional({
    description: 'Avatar image URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;

  @ApiPropertyOptional({
    description: 'User status message',
    example: 'Hey there! I am using ChatApp',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: ['male', 'female', 'other'],
  })
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'Birthday ISO date string',
    example: '1995-05-15T00:00:00.000Z',
  })
  birthday?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User profile color hex code',
    example: '#334155',
  })
  color?: string;

  @ApiProperty({
    description: 'Authentication provider',
    enum: ['credentials', 'google'],
    example: 'credentials',
  })
  provider!: 'credentials' | 'google';

  @ApiProperty({
    description: 'Whether the email address is verified',
    example: true,
  })
  emailVerified!: boolean;

  @ApiProperty({
    description: 'Current online presence status',
    example: true,
  })
  isOnline!: boolean;

  @ApiProperty({
    description: 'Account creation ISO timestamp',
    example: '2026-07-24T12:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Account last updated ISO timestamp',
    example: '2026-07-24T12:00:00.000Z',
  })
  updatedAt!: string;
}
