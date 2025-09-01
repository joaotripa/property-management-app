import { NextRequest, NextResponse } from 'next/server';
import { getS3Client, STORAGE_BUCKET, getPropertyImagePath } from '@/lib/supabase/s3-client';
import { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { validateImageFile } from '@/lib/supabase/uploads/images';

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

    if (action === 'cover') {
      if (!result.Contents || result.Contents.length === 0) {
        return NextResponse.json({ coverImageUrl: null });
      }

      const coverImage = result.Contents.find(obj => 
        obj.Key && obj.Key.includes('cover-image')
      );

      if (!coverImage || !coverImage.Key) {
        return NextResponse.json({ coverImageUrl: null });
      }

      const getCommand = new GetObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: coverImage.Key,
      });

      const coverImageUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
      return NextResponse.json({ coverImageUrl });
    }

    if (!result.Contents || result.Contents.length === 0) {
      return NextResponse.json({ imageUrls: [] });
    }

    const imageObjects = result.Contents
      .filter(obj => obj.Key && obj.Key.match(/\.(jpg|jpeg|png|webp|gif)$/i))
      .sort((a, b) => {
        const aIsCover = a.Key?.includes('cover-image');
        const bIsCover = b.Key?.includes('cover-image');
        
        if (aIsCover && !bIsCover) return -1;
        if (!aIsCover && bIsCover) return 1;
        
        return (a.Key || '').localeCompare(b.Key || '');
      });

    const imageUrls = await Promise.all(
      imageObjects.map(async (obj) => {
        const getCommand = new GetObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: obj.Key!,
        });
        return await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
      })
    );

    return NextResponse.json({ imageUrls });
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

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files to upload' }, { status: 400 });
    }

    const results = [];
    const s3Client = getS3Client();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        return NextResponse.json({ 
          error: `File ${i + 1}: ${validation.error}` 
        }, { status: 400 });
      }

      const fileExtension = file.name.split('.').pop();
      const isCover = i === coverImageIndex;
      const fileName = isCover 
        ? `cover-image.${fileExtension}`
        : `image-${i + 1}.${fileExtension}`;
      const filePath = getPropertyImagePath(propertyId, fileName);
      
      try {
        const fileBuffer = await file.arrayBuffer();

        const uploadCommand = new PutObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: filePath,
          Body: new Uint8Array(fileBuffer),
          ContentType: file.type,
          CacheControl: 'max-age=3600',
          Metadata: {
            'uploaded-by': 'domari.app',
            'property-id': propertyId,
            'file-index': i.toString(),
            'is-cover': isCover.toString(),
          }
        });

        await s3Client.send(uploadCommand);
        
        const getCommand = new GetObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: filePath,
        });
        
        const publicUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
        
        results.push({
          url: publicUrl,
          path: filePath,
          size: file.size,
        });
      } catch (error) {
        console.error(`Error uploading file ${i + 1}:`, error);
        return NextResponse.json({ 
          error: `Upload failed for file ${i + 1}` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
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