import { pool } from './db';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  const client = await pool.connect();
  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await client.query(schema);
    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the setup
setupDatabase().catch(console.error); 