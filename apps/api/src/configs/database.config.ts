import mongoose from 'mongoose';
import { environment } from './environment';

/**
 * Database Configuration Manager
 * Handles MongoDB connection with environment-based configuration
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;

  private constructor() { }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Connect to MongoDB using environment configuration
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('MongoDB is already connected');
      return;
    }

    try {
      const mongoOptions = {
        ...environment.mongo.options,
        retryWrites: environment.mongo.retryWrites,
      };

      await mongoose.connect(environment.mongo.uri, mongoOptions);

      this.isConnected = true;
      console.log(`MongoDB connected successfully to: ${this.getMaskedUri()}`);
      console.log(`Environment: ${environment.name}`);

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('MongoDB connection error:', error);
      this.isConnected = false;
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.log('MongoDB is not connected');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('MongoDB disconnected successfully');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
    }
  }

  /**
   * Check if database is connected
   */
  public isDbConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get database connection status
   */
  public getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  /**
   * Get masked URI for logging (hides credentials)
   */
  private getMaskedUri(): string {
    const uri = environment.mongo.uri;
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  }

}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Export convenience functions
export const connectDB = (): Promise<void> => databaseManager.connect();
export const disconnectDB = (): Promise<void> => databaseManager.disconnect();
export const isDbConnected = (): boolean => databaseManager.isDbConnected();
export const getDbConnectionStatus = (): string => databaseManager.getConnectionStatus();
