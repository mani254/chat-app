import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserEntity } from '@org/dal';
import { generateAccessibleColor, OtpRepository, UserRepository } from '@org/dal';
import { MailService } from '../mail/mail.service';
import { RedisPresenceService } from '../redis/redis-presence.service';
import { auth } from './better-auth.config';
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly mailService: MailService,
    private readonly redisPresenceService: RedisPresenceService,
  ) {}

  /**
   * Helper: Map DAL UserEntity to API UserResponseDto
   */
  private toUserResponseDto(user: UserEntity): UserResponseDto {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender ?? undefined,
      birthday: user.birthday ? user.birthday.toISOString() : undefined,
      avatar: user.avatar,
      status: user.status,
      isOnline: user.isOnline,
      provider: user.provider,
      phone: user.phone ?? undefined,
      emailVerified: user.emailVerified,
      color: user.color ?? undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * 1. Send OTP
   */
  async sendOtp(dto: SendOtpRequestDto): Promise<SendOtpResponseDto> {
    const email = dto.email.toLowerCase().trim();

    if (dto.purpose === 'register') {
      const userExists = await this.userRepository.findByEmail(email);
      if (userExists) {
        throw new BadRequestException('User with this email is already registered');
      }
    } else if (dto.purpose === 'forgot_password') {
      const userExists = await this.userRepository.findByEmail(email);
      if (!userExists) {
        throw new NotFoundException('No account found with this email address');
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.otpRepository.createOtp({
      email,
      otp: otpCode,
      purpose: dto.purpose,
      expiresAt,
    });

    const sent = await this.mailService.sendOtpEmail(email, otpCode, dto.purpose);
    if (!sent) {
      throw new BadRequestException('Failed to send OTP email. Please try again later.');
    }

    return {
      message: 'OTP sent successfully to your email address',
      expiresInSeconds: 600,
      email,
    };
  }

  /**
   * 2. Resend OTP
   */
  async resendOtp(dto: ResendOtpRequestDto): Promise<SendOtpResponseDto> {
    return this.sendOtp(dto);
  }

  /**
   * 3. Verify OTP
   */
  async verifyOtp(dto: VerifyOtpRequestDto): Promise<VerifyOtpResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const otpRecord = await this.otpRepository.findLatestValidOtp(email, dto.purpose);

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    if (otpRecord.otp !== dto.otp) {
      throw new BadRequestException('Invalid OTP code. Please check and try again.');
    }

    await this.otpRepository.markAsVerified(otpRecord._id);

    return {
      message: 'OTP verified successfully',
      email,
      purpose: dto.purpose,
      verified: true,
    };
  }

  /**
   * 4. Registration via Better Auth Engine
   *
   * Better Auth creates the user in the 'users' collection AND creates the session in 'sessions'.
   */
  async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const otpRecord = await this.otpRepository.findLatestValidOtp(email, 'register');
    if (!otpRecord || !otpRecord.isVerified || otpRecord.otp !== dto.otp) {
      throw new BadRequestException('Please verify your OTP code before submitting registration');
    }

    let token = '';
    try {
      const authRes = await auth.api.signUpEmail({
        body: {
          email,
          password: dto.password,
          name: dto.name,
        },
      });
      token = (authRes as { token?: string })?.token ?? '';
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      this.logger.error(`Better Auth signUpEmail failed for ${email}: ${errorMsg}`);
      throw new BadRequestException(errorMsg);
    }

    // Clean up used OTP record
    await this.otpRepository.deleteOtpsByEmailAndPurpose(email, 'register');

    // Fetch user entity from unified 'users' collection
    const userEntity = await this.userRepository.findByEmail(email);
    if (!userEntity) {
      throw new BadRequestException('User registration failed');
    }

    // Ensure custom ChatApp profile fields (provider: 'credentials', color, status, online status) are set
    const userColor = userEntity.color || generateAccessibleColor();
    await this.userRepository.updateById(userEntity._id, {
      provider: 'credentials',
      color: userColor,
      status: userEntity.status || 'Hey there! I am using ChatApp',
      emailVerified: true,
      isOnline: true,
    });

    // Track online presence in Redis
    await this.redisPresenceService.setUserOnline(userEntity._id);

    const updatedUser = (await this.userRepository.findById(userEntity._id)) ?? userEntity;

    return {
      user: this.toUserResponseDto(updatedUser),
      token,
      message: 'Registration successful',
    };
  }

  /**
   * 5. Login via Better Auth Engine
   *
   * Better Auth verifies password, creates a new session in 'sessions' collection, and returns the session token.
   */
  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();

    let token = '';
    try {
      const authRes = await auth.api.signInEmail({
        body: {
          email,
          password: dto.password,
        },
      });
      token = (authRes as { token?: string })?.token ?? '';
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid email or password';
      this.logger.warn(`Better Auth signInEmail failed for ${email}: ${errorMsg}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const userEntity = await this.userRepository.findByEmail(email);
    if (!userEntity) {
      throw new UnauthorizedException('User account not found');
    }

    // Ensure credentials provider and accessible color are present
    const userColor = userEntity.color || generateAccessibleColor();
    await this.userRepository.updateById(userEntity._id, {
      provider: userEntity.provider || 'credentials',
      color: userColor,
      isOnline: true,
    });

    // Track online presence in Redis
    await this.redisPresenceService.setUserOnline(userEntity._id);

    const updatedUser = (await this.userRepository.findById(userEntity._id)) ?? userEntity;

    return {
      user: this.toUserResponseDto(updatedUser),
      token,
      message: 'Login successful',
    };
  }

  /**
   * 6. Logout / Revoke Session
   */
  async logout(userId?: string, headers?: Headers): Promise<MessageResponseDto> {
    try {
      if (headers) {
        await auth.api.signOut({ headers });
      }
    } catch (err: unknown) {
      this.logger.warn(`Better Auth signOut error: ${err instanceof Error ? err.message : 'unknown'}`);
    }

    if (userId) {
      // Set offline in Redis & MongoDB
      await this.redisPresenceService.setUserOffline(userId);
    }

    return {
      message: 'Logged out successfully',
      success: true,
    };
  }

  /**
   * 7. Google Login
   */
  async googleLogin(dto: GoogleLoginRequestDto): Promise<AuthResponseDto> {
    let userEmail = '';
    let userName = dto.name || 'Google User';

    try {
      const decoded = await auth.api.getSession({
        headers: new Headers({ authorization: `Bearer ${dto.idToken}` }),
      });
      if (decoded?.user?.email) {
        userEmail = decoded.user.email;
        userName = decoded.user.name || userName;
      }
    } catch {
      this.logger.log('Google login processing via provider token');
    }

    if (!userEmail) {
      throw new BadRequestException('Could not verify Google ID token with Better Auth');
    }

    let userEntity = await this.userRepository.findByEmail(userEmail);
    if (!userEntity) {
      userEntity = await this.userRepository.create({
        name: userName,
        email: userEmail,
        provider: 'google',
        emailVerified: true,
        color: generateAccessibleColor(),
      });
    } else {
      await this.userRepository.updateById(userEntity._id, {
        provider: 'google',
        emailVerified: true,
        isOnline: true,
      });
    }

    // Track online presence in Redis
    await this.redisPresenceService.setUserOnline(userEntity._id);

    const updatedUser = (await this.userRepository.findById(userEntity._id)) ?? userEntity;

    return {
      user: this.toUserResponseDto(updatedUser),
      token: dto.idToken,
      message: 'Google login successful',
    };
  }

  /**
   * 8. Forgot Password (with verified OTP check)
   */
  async forgotPassword(dto: ForgotPasswordRequestDto): Promise<MessageResponseDto> {
    const email = dto.email.toLowerCase().trim();

    const userEntity = await this.userRepository.findByEmail(email);
    if (!userEntity) {
      throw new NotFoundException('No account found with this email address');
    }

    const otpRecord = await this.otpRepository.findLatestValidOtp(email, 'forgot_password');
    if (!otpRecord || !otpRecord.isVerified || otpRecord.otp !== dto.otp) {
      throw new BadRequestException('Please verify your OTP code before resetting your password');
    }

    const updated = await this.userRepository.updatePassword(userEntity._id, dto.newPassword);
    if (!updated) {
      throw new BadRequestException('Failed to update password. Please try again.');
    }

    await this.otpRepository.deleteOtpsByEmailAndPurpose(email, 'forgot_password');

    return {
      message: 'Password reset successfully. You can now login with your new password.',
      success: true,
    };
  }

  /**
   * 9. Get Authenticated User Details
   */
  getMe(user: UserEntity): UserResponseDto {
    return this.toUserResponseDto(user);
  }
}
