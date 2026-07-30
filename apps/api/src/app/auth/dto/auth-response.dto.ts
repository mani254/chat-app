import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Authenticated user profile details',
    type: UserResponseDto,
  })
  user!: UserResponseDto;

  @ApiProperty({
    description: 'Better Auth access / session token',
    example: 'ba_sess_982347109283740912',
  })
  token!: string;

  @ApiPropertyOptional({
    description: 'Status or confirmation message',
    example: 'Login successful',
  })
  message?: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Password reset successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Operation success indicator',
    example: true,
  })
  success!: boolean;
}
