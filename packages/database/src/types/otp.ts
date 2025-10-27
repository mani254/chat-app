import { OtpDocument } from '../schemas/otp';

export interface OtpGenerationRequest {
  email: string;
  type: OtpDocument['type'];
}

export interface OtpGenerationResult {
  message: string;
  data: {
    type: OtpDocument['type'];
    expiresIn: number;
    email: string;
  };
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
  type: OtpDocument['type'];
}

export interface OtpVerificationResult {
  message: string;
  data: {
    email: string;
    type: OtpDocument['type'];
    verified: boolean;
  };
}
