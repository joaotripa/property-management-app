import { NextRequest, NextResponse } from 'next/server';
import { handleCoverImageUpdate, ImageServiceError } from '@/lib/services/imageService';
import { getS3Client, STORAGE_BUCKET } from '@/lib/supabase/s3-client';
import { ListObjectsV2Command, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const s3Client = getS3Client();
    const listCommand = new ListObjectsV2Command({
      Bucket: STORAGE_BUCKET,
      Prefix: `${propertyId}/`,
    });

    const result = await s3Client.send(listCommand);

    if (!result.Contents || result.Contents.length === 0) {
      return NextResponse.json({ coverImageUrl: null });
    }

    let coverImage = null;
    for (const obj of result.Contents) {
      if (!obj.Key) continue;

      try {
        const headCommand = new HeadObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: obj.Key,
        });
        const metadata = await s3Client.send(headCommand);

        if (metadata.Metadata && metadata.Metadata['is-cover'] === 'true') {
          coverImage = obj;
          break;
        }
      } catch (error) {
        console.warn(`Failed to get metadata for ${obj.Key}:`, error);
      }
    }

    if (!coverImage || !coverImage.Key) {
      if (result.Contents && result.Contents.length > 0) {
        coverImage = result.Contents[0];
      } else {
        return NextResponse.json({ coverImageUrl: null });
      }
    }

    const getCommand = new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: coverImage.Key,
    });

    const coverImageUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
    return NextResponse.json({ coverImageUrl });
  } catch (error) {
    console.error('Cover image GET API error:', error);

    if (error instanceof ImageServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 400 });
    }

    return NextResponse.json({
      error: 'Failed to fetch cover image'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const body = await request.json();
    const { imageId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    if (!imageId || typeof imageId !== 'string') {
      return NextResponse.json({ error: 'Valid image ID is required' }, { status: 400 });
    }

    // Use service layer to handle the cover image update
    await handleCoverImageUpdate(propertyId, imageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cover image update API error:', error);

    if (error instanceof ImageServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 400 });
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}