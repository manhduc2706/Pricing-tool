import dotenv from 'dotenv';
import _ from 'lodash';

interface IServer {
  host: string;
  port: number;
}

interface IApi {
  version: string;
  basePath: string;
}

interface IJWT {
  secret: string;
  expiresIn: string;
}

interface IMongoOptions {
  maxPoolSize?: number;
  minPoolSize?: number;
  maxIdleTimeMS?: number;
  connectTimeoutMS?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
}

interface IMongo {
  uri: string;
  retryWrites: boolean;
  options: IMongoOptions;
}

interface IRedis {
  host: string;
  port: number;
  db: number;
  password?: string;
}

interface IStorage {
  type: string;
  path: string;
  maxFileSize: string;
}

interface IMinIO {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region: string;
  bucketPrefix: string;
  bucketName: string;
}

interface IFileUpload {
  maxImageFileSize: string;
  allowedImageFormats: string[];
}

interface IAdmin {
  email: string;
  password: string;
}

interface ILogging {
  level: string;
  file: string;
}

interface ICors {
  origin: string;
  methods: string[];
}

interface IRateLimit {
  windowMs: number;
  maxRequests: number;
}

interface IMonitoring {
  healthCheckInterval: number;
  metricsEnabled: boolean;
}

interface IExternalApi {
  timeout: number;
  retryAttempts: number;
}

type EnvironmentName = 'DEVELOPMENT' | 'PRODUCTION' | 'TEST';

interface IEnvironment {
  dotenv: dotenv.DotenvConfigOutput;
  name: EnvironmentName;
  api: IApi;
  server: IServer;
  jwt: IJWT;
  mongo: IMongo;
  redis: IRedis;
  storage: IStorage;
  minio: IMinIO;
  fileUpload: IFileUpload;
  admin: IAdmin;
  logging: ILogging;
  cors: ICors;
  rateLimit: IRateLimit;
  monitoring: IMonitoring;
  externalApi: IExternalApi;
}

// Try to load .env file, but don't fail if it doesn't exist (for Docker containers)
const dotenvResult = (() => {
  try {
    return dotenv.config();
  } catch (error) {
    console.warn('No .env file found, using environment variables from system');
    return { parsed: {}, error: undefined };
  }
})();

export const environment: IEnvironment = {
  dotenv: dotenvResult,
  name: (process.env.NODE_ENV as EnvironmentName) || 'DEVELOPMENT',
  api: {
    version: get('API_VERSION') || 'v1',
    basePath: `/api/${get('API_VERSION') || 'v1'}`,
  },
  server: {
    host: get('SERVER_HOST') || 'localhost',
    port: Number(get('SERVER_PORT')) || 3000,
  },
  jwt: {
    secret: get('JWT_SECRET') || 'default-secret-key',
    expiresIn: get('JWT_EXPIRES_IN') || '7d',
  },
  mongo: {
    uri: get('MONGO_CONNECTION') || 'mongodb://admin:admin123@pricing-tool-mongo:27017/pricing-tool?authSource=admin',
    retryWrites: get('MONGO_RETRY_WRITES') === 'true',
    options: {
      maxPoolSize: Number(get('MONGO_MAX_POOL_SIZE')) || 10,
      minPoolSize: Number(get('MONGO_MIN_POOL_SIZE')) || 2,
      maxIdleTimeMS: Number(get('MONGO_MAX_IDLE_TIME_MS')) || 30000,
      connectTimeoutMS: Number(get('MONGO_CONNECT_TIMEOUT_MS')) || 10000,
      serverSelectionTimeoutMS: Number(get('MONGO_SERVER_SELECTION_TIMEOUT_MS')) || 5000,
      socketTimeoutMS: Number(get('MONGO_SOCKET_TIMEOUT_MS')) || 45000,
    },
  },
  redis: {
    host: get('REDIS_HOST') || 'localhost',
    port: Number(get('REDIS_PORT')) || 26379,
    db: Number(get('REDIS_DB')) || 0,
    password: get('REDIS_PASSWORD') || undefined,
  },
  storage: {
    type: get('STORAGE_TYPE') || 'minio',
    path: get('STORAGE_PATH') || './storage',
    maxFileSize: get('MAX_FILE_SIZE') || '100MB',
  },
  minio: {
    endpoint: get('MINIO_ENDPOINT') || 'localhost',
    port: Number(get('MINIO_PORT')) || 29000,
    useSSL: get('MINIO_USE_SSL') === 'true',
    accessKey: get('MINIO_ACCESS_KEY') || 'minioadmin',
    secretKey: get('MINIO_SECRET_KEY') || 'minioadmin123',
    region: get('MINIO_REGION') || 'us-east-1',
    bucketPrefix: get('MINIO_BUCKET_PREFIX') || 'pricing-tool',
    bucketName: get('MINIO_BUCKET_NAME') || 'pricing-tool-files',
  },
  fileUpload: {
    maxImageFileSize: get('MAX_IMAGE_FILE_SIZE') || '10MB',
    allowedImageFormats: (get('ALLOWED_IMAGE_FORMATS') || 'jpg,jpeg,png,gif,webp').split(','),
  },
  admin: {
    email: get('ADMIN_EMAIL') || 'admin@pricing-tool.com',
    password: get('ADMIN_PASSWORD') || 'admin123',
  },
  logging: {
    level: get('LOG_LEVEL') || 'info',
    file: get('LOG_FILE') || './logs/app.log',
  },
  cors: {
    origin: get('CORS_ORIGIN') || 'http://localhost:3000,http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  },
  rateLimit: {
    windowMs: Number(get('RATE_LIMIT_WINDOW_MS')) || 900000,
    maxRequests: Number(get('RATE_LIMIT_MAX_REQUESTS')) || 100,
  },
  monitoring: {
    healthCheckInterval: Number(get('HEALTH_CHECK_INTERVAL')) || 30000,
    metricsEnabled: get('METRICS_ENABLED') === 'true',
  },
  externalApi: {
    timeout: Number(get('EXTERNAL_API_TIMEOUT')) || 30000,
    retryAttempts: Number(get('EXTERNAL_API_RETRY_ATTEMPTS')) || 3,
  },
};

/**
 * Get environment variable with fallback to environment prefix
 * @param key - The key to get from environment variables
 * @returns The environment variable value
 */
function get(key: string): string {
  // First try to get the direct environment variable (for Docker Compose)
  const directValue = process.env[key];
  if (directValue) {
    return directValue;
  }

  // Fallback to prefixed environment variable (for local development)
  if (process.env.NODE_ENV) {
    const name = [process.env.NODE_ENV, key].join('_');
    const prefixedValue = process.env[name];
    if (prefixedValue) {
      return prefixedValue;
    }
  }

  return '';
}
