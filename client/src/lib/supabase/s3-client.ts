import { S3Client } from '@aws-sdk/client-s3';

function createS3Client() {
  const endpoint = process.env.SUPABASE_S3_ENDPOINT;
  const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;

  // Only create S3 client if all required environment variables are available
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing required S3 environment variables');
  }

  const supabaseS3Config = {
    region: process.env.SUPABASE_S3_REGION || 'eu-west-1',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  };

  return new S3Client(supabaseS3Config);
}

let _s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = createS3Client();
  }
  return _s3Client;
}

export const STORAGE_BUCKET = 'property-images';

export function getPropertyImagePath(propertyId: string, fileName: string): string {
  return `${propertyId}/${fileName}`;
}