import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Run database migrations programmatically
 * This can be called before app startup or in CI/CD pipelines
 */
export async function runMigrations(): Promise<void> {
  console.log('Running database migrations...');
  
  try {
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate', {
      cwd: path.resolve(__dirname, '../..'),
      env: { ...process.env }
    });
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error('Migration warnings:', stderr);
    }
    
    console.log('✓ Migrations completed successfully');
  } catch (error: any) {
    console.error('✗ Migration failed:', error.message);
    if (error.stdout) {
      console.error('stdout:', error.stdout);
    }
    if (error.stderr) {
      console.error('stderr:', error.stderr);
    }
    throw new Error('Database migration failed');
  }
}

/**
 * Check migration status
 */
export async function checkMigrationStatus(): Promise<void> {
  try {
    const { stdout } = await execAsync('npx sequelize-cli db:migrate:status', {
      cwd: path.resolve(__dirname, '../..'),
      env: { ...process.env }
    });
    
    console.log('Migration Status:');
    console.log(stdout);
  } catch (error: any) {
    console.error('Failed to check migration status:', error.message);
    throw error;
  }
}

/**
 * Rollback last migration
 */
export async function rollbackMigration(): Promise<void> {
  console.log('Rolling back last migration...');
  
  try {
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate:undo', {
      cwd: path.resolve(__dirname, '../..'),
      env: { ...process.env }
    });
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error('Rollback warnings:', stderr);
    }
    
    console.log('✓ Rollback completed successfully');
  } catch (error: any) {
    console.error('✗ Rollback failed:', error.message);
    throw error;
  }
}

// If this file is run directly, execute migrations
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}
