import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import type { OtpPurpose } from '@org/shared';

export class VerifyOtpRequestDto {
  @ApiProperty({
    description: 'Email address linked to the OTP',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: '6-digit OTP code received via email',
    example: '123456',
  })
  @IsString({ message: 'OTP must be a string' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp!: string;

  @ApiProperty({
    description: 'Purpose of the OTP code',
    enum: ['register', 'forgot_password'],
    example: 'register',
  })
  @IsIn(['register', 'forgot_password'], {
    message: 'Purpose must be either "register" or "forgot_password"',
  })
  @IsNotEmpty({ message: 'Purpose is required' })
  purpose!: OtpPurpose;
}

export class VerifyOtpResponseDto {
  @ApiProperty({
    description: 'Verification outcome',
    example: true,
  })
  verified!: boolean;

  @ApiProperty({
    description: 'Status message',
    example: 'OTP verified successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Verified email address',
    example: 'john@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Purpose of OTP code',
    enum: ['register', 'forgot_password'],
    example: 'register',
  })
  purpose!: OtpPurpose;
}
