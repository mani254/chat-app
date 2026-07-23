import mongoose from 'mongoose';

let isConnected = false;

/**
 * Establishes a singleton MongoDB connection using Mongoose.
 *
 * This should be called ONCE at application startup (e.g. in your server
 * bootstrap file). Subsequent calls are no-ops — the connection is reused.
 *
 * The DAL library itself never calls this. The application layer owns the
 * connection lifecycle.
 *
 * @param uri - A full MongoDB connection string. Defaults to MONGODB_URI env var.
 */
export async function connectDatabase(uri?: string): Promise<void> {
  if (isConnected) {
    return;
  }

  const connectionUri = uri ?? process.env['MONGODB_URI'];

  if (!connectionUri) {
    throw new Error(
      '[DAL] MongoDB connection URI is required. ' +
        'Pass it as an argument or set the MONGODB_URI environment variable.',
    );
  }

  await mongoose.connect(connectionUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  console.log('[DAL] MongoDB connected');

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[DAL] MongoDB disconnected');
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('[DAL] MongoDB connection error:', err.message);
  });
}

/**
 * Gracefully closes the MongoDB connection.
 *
 * Call this during application shutdown (e.g. SIGTERM handler).
 */
export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }
  await mongoose.disconnect();
  isConnected = false;
  console.log('[DAL] MongoDB disconnected gracefully');
}
