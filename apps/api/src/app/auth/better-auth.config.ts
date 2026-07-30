import { dash } from '@better-auth/infra';
import { DB_COLLECTIONS } from '@org/dal';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer } from 'better-auth/plugins';
import mongoose from 'mongoose';

type MongoDb = NonNullable<typeof mongoose.connection.db>;

const secret: string =
  process.env['BETTER_AUTH_SECRET'] ||
  process.env['BETTER_AUTH_API_KEY'] ||
  '';

/**
 * Strongly-typed Lazy DB Proxy for mongodbAdapter using Mongoose's MongoDb type.
 *
 * Resolves mongoose.connection.db dynamically at runtime when Better Auth endpoints
 * are invoked, avoiding import-time connection race conditions without any 'any' types.
 */
const lazyDb: MongoDb = new Proxy({} as unknown as MongoDb, {
  get<K extends keyof MongoDb>(_target: MongoDb, prop: K): MongoDb[K] {
    const db: MongoDb | undefined = mongoose.connection.db;
    if (!db) {
      throw new Error(
        '[BetterAuth] MongoDB is not connected yet. Ensure connectDatabase() ran in main.ts.',
      );
    }
    const value = db[prop];
    return typeof value === 'function' ? (value.bind(db) as MongoDb[K]) : value;
  },
});

export const options: BetterAuthOptions = {
  database: mongodbAdapter(lazyDb),
  secret,
  baseURL: process.env['BETTER_AUTH_URL'] || 'http://localhost:8080',
  user: {
    modelName: DB_COLLECTIONS.USERS, // Unifies Better Auth to target 'users' collection!
    fields: {
      image: 'avatar',
    },
    additionalFields: {
      color: {
        type: 'string',
        required: false,
      },
      provider: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        required: false,
      },
      isOnline: {
        type: 'boolean',
        required: false,
      },
    },
  },
  session: {
    modelName: 'sessions',
  },
  account: {
    modelName: 'accounts',
  },
  verification: {
    modelName: 'verifications',
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env['GOOGLE_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          console.log(
            '[BetterAuthHook] User created in unified users collection:',
            user.email,
          );
        },
      },
      update: {
        after: async (user) => {
          console.log(
            '[BetterAuthHook] User updated in unified users collection:',
            user.email,
          );
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          console.log(
            '[BetterAuthHook] Account created for user:',
            account.userId,
            account.providerId,
          );
        },
      },
    },
  },
  plugins: [dash(), bearer()],
};

export const auth = betterAuth(options);
