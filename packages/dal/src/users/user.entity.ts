import type { RawUserDocument } from './user.schema.js';

/**
 * UserEntity — the application's canonical representation of a User.
 *
 * Responsibilities:
 *  - Maps MongoDB `_id` (ObjectId) → `id` (string)
 *  - Strips sensitive fields (password is NEVER included)
 *  - Converts Dates to ISO strings for consistent serialization
 *  - Hides all Mongoose / MongoDB implementation details
 *
 * Consumers should work only with UserEntity — never with raw Mongoose documents.
 */
export class UserEntity {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly gender?: 'male' | 'female' | 'other';
  readonly birthday?: Date;
  readonly avatar: string;
  readonly status: string;
  readonly isOnline: boolean;
  readonly provider: 'credentials' | 'google';
  readonly providerId?: string;
  readonly phone?: string;
  readonly emailVerified: boolean;
  readonly color?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(data: {
    id: string;
    name: string;
    email: string;
    gender?: 'male' | 'female' | 'other';
    birthday?: Date;
    avatar: string;
    status: string;
    isOnline: boolean;
    provider: 'credentials' | 'google';
    providerId?: string;
    phone?: string;
    emailVerified: boolean;
    color?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.gender = data.gender;
    this.birthday = data.birthday;
    this.avatar = data.avatar;
    this.status = data.status;
    this.isOnline = data.isOnline;
    this.provider = data.provider;
    this.providerId = data.providerId;
    this.phone = data.phone;
    this.emailVerified = data.emailVerified;
    this.color = data.color;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Factory method: converts a raw Mongoose document into a clean UserEntity.
   * This is the only way to construct a UserEntity.
   *
   * Note: `password` is intentionally omitted — it must never leave the DAL.
   */
  static fromDocument(doc: RawUserDocument): UserEntity {
    return new UserEntity({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      gender: doc.gender as 'male' | 'female' | 'other' | undefined,
      birthday: doc.birthday instanceof Date ? doc.birthday : undefined,
      avatar: doc.avatar ?? '',
      status: doc.status ?? '',
      isOnline: doc.isOnline ?? false,
      provider: (doc.provider as 'credentials' | 'google') ?? 'credentials',
      providerId: doc.providerId ?? undefined,
      phone: doc.phone ?? undefined,
      emailVerified: doc.emailVerified ?? false,
      color: doc.color ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Returns a plain JSON-safe object.
   * Useful when you need to serialize the entity (e.g. for API responses).
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      gender: this.gender,
      birthday: this.birthday?.toISOString(),
      avatar: this.avatar,
      status: this.status,
      isOnline: this.isOnline,
      provider: this.provider,
      providerId: this.providerId,
      phone: this.phone,
      emailVerified: this.emailVerified,
      color: this.color,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
