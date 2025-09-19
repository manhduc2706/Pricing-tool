import * as Minio from 'minio';
import { environment } from './environment';

/**
 * MinIO Configuration Interface
 */
export interface MinIOConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region?: string;
}

/**
 * MinIO Client Singleton
 * Provides a single instance of MinIO client throughout the application
 */
class MinIOClientManager {
  private static instance: MinIOClientManager;
  private client: Minio.Client | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): MinIOClientManager {
    if (!MinIOClientManager.instance) {
      MinIOClientManager.instance = new MinIOClientManager();
    }
    return MinIOClientManager.instance;
  }

  /**
   * Initialize MinIO client with configuration from environment
   */
  public initialize(): Minio.Client {
    if (this.isInitialized && this.client) {
      return this.client;
    }

    const config: MinIOConfig = {
      endPoint: environment.minio.endpoint,
      port: environment.minio.port,
      useSSL: environment.minio.useSSL,
      accessKey: environment.minio.accessKey,
      secretKey: environment.minio.secretKey,
      region: environment.minio.region,
    };

    // Validate required configuration
    if (!config.endPoint || !config.accessKey || !config.secretKey) {
      throw new Error('MinIO configuration is incomplete. Please check environment variables.');
    }

    try {
      this.client = new Minio.Client(config);
      this.isInitialized = true;

      console.log('MinIO client initialized successfully', {
        endPoint: config.endPoint,
        port: config.port,
        useSSL: config.useSSL,
        region: config.region,
        environment: environment.name,
      });

      return this.client;
    } catch (error) {
      console.error('Failed to initialize MinIO client', { 
        error, 
        config: { ...config, secretKey: '***' } 
      });
      throw error;
    }
  }

  /**
   * Get MinIO client instance
   * Initializes if not already done
   */
  public getClient(): Minio.Client {
    if (!this.client || !this.isInitialized) {
      return this.initialize();
    }
    return this.client;
  }

  /**
   * Check if client is initialized
   */
  public isClientInitialized(): boolean {
    return this.isInitialized && this.client !== null;
  }

  /**
   * Reset client (useful for testing)
   */
  public reset(): void {
    this.client = null;
    this.isInitialized = false;
  }

  /**
   * Test MinIO connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.listBuckets();
      console.log('MinIO connection test successful');
      return true;
    } catch (error) {
      console.error('MinIO connection test failed', { error });
      return false;
    }
  }

  /**
   * Get MinIO configuration from environment
   */
  public getConfig(): MinIOConfig {
    return {
      endPoint: environment.minio.endpoint,
      port: environment.minio.port,
      useSSL: environment.minio.useSSL,
      accessKey: environment.minio.accessKey,
      secretKey: environment.minio.secretKey,
      region: environment.minio.region,
    };
  }

  /**
   * Get bucket prefix from environment
   */
  public getBucketPrefix(): string {
    return environment.minio.bucketPrefix;
  }

  /**
   * Get bucket name from environment
   */
  public getBucketName(): string {
    return environment.minio.bucketName;
  }

  /**
   * Health check for MinIO connection
   */
  public async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const client = this.getClient();
      const buckets = await client.listBuckets();
      
      return {
        status: 'healthy',
        details: {
          isInitialized: this.isInitialized,
          bucketsCount: buckets.length,
          config: {
            endPoint: environment.minio.endpoint,
            port: environment.minio.port,
            useSSL: environment.minio.useSSL,
            region: environment.minio.region,
            bucketPrefix: environment.minio.bucketPrefix,
            bucketName: environment.minio.bucketName,
          },
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          isInitialized: this.isInitialized,
          config: {
            endPoint: environment.minio.endpoint,
            port: environment.minio.port,
            useSSL: environment.minio.useSSL,
          },
        },
      };
    }
  }
}

// Export singleton instance
export const minioClientManager = MinIOClientManager.getInstance();

// Export convenience functions
export const getMinIOClient = (): Minio.Client => minioClientManager.getClient();
export const getMinIOConfig = (): MinIOConfig => minioClientManager.getConfig();
export const getBucketPrefix = (): string => minioClientManager.getBucketPrefix();
export const getBucketName = (): string => minioClientManager.getBucketName();
export const testMinIOConnection = (): Promise<boolean> => minioClientManager.testConnection();
export const minioHealthCheck = () => minioClientManager.healthCheck();

// Initialize client on module load
try {
  minioClientManager.initialize();
} catch (error) {
  console.warn('MinIO client initialization deferred due to configuration issues', { error });
}
