import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';
import type { OtpPurpose } from '@org/shared';

export class SendOtpRequestDto {
  @ApiProperty({
    description: 'Email address to send OTP code to',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'Purpose of OTP request',
    enum: ['register', 'forgot_password'],
    example: 'register',
  })
  @IsIn(['register', 'forgot_password'], {
    message: 'Purpose must be either "register" or "forgot_password"',
  })
  @IsNotEmpty({ message: 'Purpose is required' })
  purpose!: OtpPurpose;
}

export class ResendOtpRequestDto {
  @ApiProperty({
    description: 'Email address to resend OTP code to',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'Purpose of OTP request',
    enum: ['register', 'forgot_password'],
    example: 'register',
  })
  @IsIn(['register', 'forgot_password'], {
    message: 'Purpose must be either "register" or "forgot_password"',
  })
  @IsNotEmpty({ message: 'Purpose is required' })
  purpose!: OtpPurpose;
}

export class SendOtpResponseDto {
  @ApiProperty({
    description: 'Status message',
    example: 'OTP sent successfully to your email address',
  })
  message!: string;

  @ApiProperty({
    description: 'Validity duration of the OTP code in seconds',
    example: 600,
  })
  expiresInSeconds!: number;

  @ApiProperty({
    description: 'Recipient email address',
    example: 'john@example.com',
  })
  email!: string;
}
