export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  phone?: string;
  color?: string;
  provider: 'credentials' | 'google';
  emailVerified: boolean;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserResponse = User;
