import { NextRequest, NextResponse } from 'next/server';
import { getS3Client, STORAGE_BUCKET, getPropertyImagePath } from '@/lib/supabase/s3-client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: propertyId, imageId } = await params;

    if (!propertyId || !imageId) {
      return NextResponse.json({ error: 'Property ID and Image ID are required' }, { status: 400 });
    }

    const filePath = getPropertyImagePath(propertyId, imageId);
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;
    
    return NextResponse.json({ 
      url: publicUrl,
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