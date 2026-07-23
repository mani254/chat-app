export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  avatar?: string;
  status?: string;
  provider?: 'credentials' | 'google';
  providerId?: string;
  phone?: string;
  emailVerified?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  status?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  phone?: string;
  emailVerified?: boolean;
  color?: string;
}
