import { Pool, PoolConfig } from 'pg';
import path from 'path';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});


const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'ai_productivity_db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(dbConfig);

pool.on('connect', () => {
  logger.info('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

export const connectDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    logger.info('✅ Database connected successfully');
    client.release();
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const query = async (text: string, params?: unknown[]): Promise<any> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error:', { text, error });
    throw error;
  }
};

export default pool;
