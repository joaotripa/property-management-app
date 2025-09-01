import { NextRequest, NextResponse } from 'next/server';
import { getS3Client, STORAGE_BUCKET, getPropertyImagePath } from '@/lib/supabase/s3-client';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: propertyId, imageId } = await params;

    if (!propertyId || !imageId) {
      return NextResponse.json({ error: 'Property ID and Image ID are required' }, { status: 400 });
    }

    const s3Client = getS3Client();
    const filePath = getPropertyImagePath(propertyId, imageId);
    
    const getCommand = new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: filePath,
    });
    
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
    
    return NextResponse.json({ 
      url: signedUrl,
      path: filePath 
    });
  } catch (error) {
    console.error('Get image API error:', error);
    return NextResponse.json({ 
      error: 'Failed to get image' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: propertyId, imageId } = await params;
    
    if (!propertyId || !imageId) {
      return NextResponse.json({ error: 'Property ID and Image ID are required' }, { status: 400 });
    }

    const s3Client = getS3Client();
    const filePath = getPropertyImagePath(propertyId, imageId);
    
    const deleteCommand = new DeleteObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: filePath,
    });

    await s3Client.send(deleteCommand);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete image API error:', error);
    return NextResponse.json({ 
      error: 'Delete operation failed' 
    }, { status: 500 });
  }
}