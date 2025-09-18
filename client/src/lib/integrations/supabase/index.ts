// Client-side exports
export { createClient, supabase } from './client';

// Server-side exports
export { createServerSupabaseClient, createServiceSupabaseClient } from './server';

// Types and utilities
export type { Database } from './types';

// S3 client
export * from './s3-client';