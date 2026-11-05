/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import ws from "ws";
// import * as schema from "@shared/schema";
// import 'dotenv/config';

// neonConfig.webSocketConstructor = ws;


import { Pool } from "pg";
import { BOTFIZZ_PRODUCT_NAME } from "@botfizz/core";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import "dotenv/config";


if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Minimum required PostgreSQL privileges for the application user:
//   CONNECT on the database
//   USAGE on the public schema
//   SELECT, INSERT, UPDATE, DELETE on all application tables
//   USAGE, SELECT on all sequences
//   Do NOT grant SUPERUSER, CREATEDB, CREATEROLE, or pg_read_all_data.
//   Example: GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DB_POOL_MAX || '25', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true,
    ssl: process.env.DATABASE_SSL === 'false' 
      ? false 
      : process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
  });

  pool.on('error', (err) => {
    console.error(`[${BOTFIZZ_PRODUCT_NAME}] Unexpected database pool error:`, err.message);
  });
  
  export const db = drizzle(pool, { schema });

  const readPool = process.env.DATABASE_READ_URL
    ? new Pool({
        connectionString: process.env.DATABASE_READ_URL,
        max: parseInt(process.env.DB_POOL_MAX || '25', 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        allowExitOnIdle: true,
        ssl: process.env.DATABASE_SSL === 'false' 
          ? false 
          : process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: true }
            : process.env.DATABASE_SSL === 'true'
              ? { rejectUnauthorized: false }
              : false,
      })
    : pool;

  if (process.env.DATABASE_READ_URL) {
    readPool.on('error', (err) => {
      console.error(`[${BOTFIZZ_PRODUCT_NAME}] Unexpected read replica pool error:`, err.message);
    });
    console.log(`[${BOTFIZZ_PRODUCT_NAME}] Read replica database configured`);
  }

  export const dbRead = process.env.DATABASE_READ_URL
    ? drizzle(readPool, { schema })
    : db;

// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool, schema });