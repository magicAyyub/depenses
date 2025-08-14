import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Vérifier que la variable d'environnement DATABASE_URL existe
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('Make sure your .env file contains:');
  console.error('DATABASE_URL=your-neon-database-url');
  throw new Error('DATABASE_URL environment variable is required');
}

// Créer la connexion Neon
const sql = neon(databaseUrl);

// Créer l'instance Drizzle avec le schéma
export const db = drizzle(sql, { schema });

export * from './schema';
