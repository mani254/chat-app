import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

async function checkDb() {
  loadEnv();
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      '\x1b[31m[DB Pre-flight Check] ❌ MONGODB_URI is missing in .env!\x1b[0m',
    );
    console.error(
      'Please configure MONGODB_URI in your root .env file before running dev or build.\n',
    );
    process.exit(1);
  }

  console.log('[DB Pre-flight Check] 🔍 Validating MongoDB connection...');
  try {
    const timeout =
      Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 4000;
    await mongoose.connect(uri, { serverSelectionTimeoutMS: timeout });
    console.log(
      '\x1b[32m[DB Pre-flight Check] ✅ MongoDB connection successful.\x1b[0m',
    );
    await mongoose.disconnect();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `\x1b[31m[DB Pre-flight Check] ❌ Failed to connect to MongoDB:\x1b[0m ${message}`,
    );
    console.error(
      'Execution halted. Fix database connectivity/credentials in .env before proceeding.\n',
    );
    process.exit(1);
  }
}

checkDb();
