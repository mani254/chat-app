import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { UserEntity } from '@org/dal';
import type { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import {
  AuthResponseDto,
  ForgotPasswordRequestDto,
  GoogleLoginRequestDto,
  LoginRequestDto,
  MessageResponseDto,
  RegisterRequestDto,
  ResendOtpRequestDto,
  SendOtpRequestDto,
  SendOtpResponseDto,
  UserResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
} from './dto';

@ApiTags('Authentication & User')
@Controller({ path: 'auth', version: [VERSION_NEUTRAL, '1'] })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit OTP to user email' })
  @ApiResponse({
    status: 200,
    type: SendOtpResponseDto,
    description: 'OTP sent successfully to email',
  })
  async sendOtp(
    @Body() dto: SendOtpRequestDto,
  ): Promise<SendOtpResponseDto> {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend 6-digit OTP to user email' })
  @ApiResponse({
    status: 200,
    type: SendOtpResponseDto,
    description: 'OTP re-sent successfully to email',
  })
  async resendOtp(
    @Body() dto: ResendOtpRequestDto,
  ): Promise<SendOtpResponseDto> {
    return this.authService.resendOtp(dto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code for email' })
  @ApiResponse({
    status: 200,
    type: VerifyOtpResponseDto,
    description: 'OTP verified successfully',
  })
  async verifyOtp(
    @Body() dto: VerifyOtpRequestDto,
  ): Promise<VerifyOtpResponseDto> {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account with verified OTP' })
  @ApiResponse({
    status: 201,
    type: AuthResponseDto,
    description: 'User account created successfully',
  })
  async register(
    @Body() dto: RegisterRequestDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'Login successful',
  })
  async login(
    @Body() dto: LoginRequestDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current user and revoke session' })
  @ApiResponse({
    status: 200,
    type: MessageResponseDto,
    description: 'Logged out successfully',
  })
  async logout(
    @Req() req: FastifyRequest,
    @CurrentUser() user?: UserEntity,
  ): Promise<MessageResponseDto> {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.append(key, value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          headers.append(key, item);
        }
      }
    }
    return this.authService.logout(user?._id, headers);
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user via Google OAuth ID token' })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'Google login successful',
  })
  async googleLogin(
    @Body() dto: GoogleLoginRequestDto,
  ): Promise<AuthResponseDto> {
    return this.authService.googleLogin(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password with verified OTP' })
  @ApiResponse({
    status: 200,
    type: MessageResponseDto,
    description: 'Password reset successfully',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(dto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current authenticated user details' })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'User profile returned successfully',
  })
  async getMe(
    @CurrentUser() user: UserEntity,
  ): Promise<UserResponseDto> {
    return this.authService.getMe(user);
  }
}
