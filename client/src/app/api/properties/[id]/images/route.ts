import { NextRequest, NextResponse } from 'next/server';
import { getS3Client, STORAGE_BUCKET } from '@/lib/supabase/s3-client';
import { ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { handlePropertyImageUpload, ImageServiceError } from '@/lib/services/imageService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const { id: propertyId } = await params;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const s3Client = getS3Client();
    const listCommand = new ListObjectsV2Command({
      Bucket: STORAGE_BUCKET,
      Prefix: `${propertyId}/`,
      MaxKeys: action === 'check' ? 1 : undefined,
    });

    const result = await s3Client.send(listCommand);
    
    if (action === 'check') {
      return NextResponse.json({ 
        hasImages: Boolean(result.Contents && result.Contents.length > 0) 
      });
    }

    if (!result.Contents || result.Contents.length === 0) {
      return NextResponse.json({ imageUrls: [] });
    }

    const imageObjectsWithMetadata = await Promise.all(
      result.Contents
        .filter(obj => obj.Key && obj.Key.match(/\.(jpg|jpeg|png|webp|gif)$/i))
        .map(async (obj) => {
          let isCover = false;
          try {
            const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
            const headCommand = new HeadObjectCommand({
              Bucket: STORAGE_BUCKET,
              Key: obj.Key!,
            });
            const metadata = await s3Client.send(headCommand);
            isCover = Boolean(metadata.Metadata && metadata.Metadata['is-cover'] === 'true');
          } catch (error) {
            console.warn(`Failed to get metadata for ${obj.Key}:`, error);
          }

          return { ...obj, isCover };
        })
    );

    const imageObjects = imageObjectsWithMetadata.sort((a, b) => {
      if (a.isCover && !b.isCover) return -1;
      if (!a.isCover && b.isCover) return 1;
      return (a.Key || '').localeCompare(b.Key || '');
    });

    if (imageObjects.length > 0 && !imageObjects.some(obj => obj.isCover)) {
      imageObjects[0].isCover = true;
    }

    const imageData = await Promise.all(
      imageObjects.map(async (obj) => {
        const getCommand = new GetObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: obj.Key!,
        });
        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
        const filename = obj.Key!.split('/').pop()?.split('?')[0] || '';

        return {
          url: signedUrl,
          filename: filename,
          key: obj.Key!,
          isCover: obj.isCover || false
        };
      })
    );

    const imageUrls = imageData.map(item => item.url);

    return NextResponse.json({
      imageUrls,
      images: imageData
    });
  } catch (error) {
    console.error('Property images API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch property images' 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formData = await request.formData();
    const { id: propertyId } = await params;
    const coverImageIndex = parseInt(formData.get('coverImageIndex') as string) || 0;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const files: File[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith('file-') && value instanceof File) {
        files.push(value);
      }
    });

    const results = await handlePropertyImageUpload(propertyId, files, coverImageIndex);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Upload API error:', error);

    if (error instanceof ImageServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 400 });
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
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

    const listResult = await s3Client.send(listCommand);

    if (listResult.Contents && listResult.Contents.length > 0) {
      for (const obj of listResult.Contents) {
        if (obj.Key) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: STORAGE_BUCKET,
            Key: obj.Key,
          });
          await s3Client.send(deleteCommand);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete all images API error:', error);
    return NextResponse.json({ 
      error: 'Delete operation failed' 
    }, { status: 500 });
  }
}