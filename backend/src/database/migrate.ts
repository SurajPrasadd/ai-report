import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const runMigration = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    logger.info('Starting database migration...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSQL);
    logger.info('✅ Schema migration completed successfully');
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigration().catch(console.error);
