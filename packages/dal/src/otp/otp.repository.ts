import { type OtpEntity, toOtpEntity } from './otp.entity.js';
import { type RawOtpDocument, OtpModel } from './otp.schema.js';

export class OtpRepository {
  async createOtp(data: {
    email: string;
    otp: string;
    purpose: 'register' | 'forgot_password';
    expiresAt: Date;
  }): Promise<OtpEntity> {
    const email = data.email.toLowerCase().trim();

    await OtpModel.deleteMany({ email, purpose: data.purpose }).exec();

    const doc = await OtpModel.create({
      email,
      otp: data.otp,
      purpose: data.purpose,
      expiresAt: data.expiresAt,
      isVerified: false,
    });

    return toOtpEntity(doc.toObject() as RawOtpDocument);
  }

  async findLatestValidOtp(
    email: string,
    purpose: 'register' | 'forgot_password',
  ): Promise<OtpEntity | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const doc = await OtpModel.findOne({
      email: normalizedEmail,
      purpose,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean<RawOtpDocument>()
      .exec();

    return doc ? toOtpEntity(doc) : null;
  }

  async markAsVerified(id: string): Promise<OtpEntity | null> {
    const doc = await OtpModel.findByIdAndUpdate(
      id,
      { $set: { isVerified: true } },
      { new: true },
    )
      .lean<RawOtpDocument>()
      .exec();

    return doc ? toOtpEntity(doc) : null;
  }

  async deleteOtpsByEmailAndPurpose(
    email: string,
    purpose: 'register' | 'forgot_password',
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    await OtpModel.deleteMany({ email: normalizedEmail, purpose }).exec();
  }
}
