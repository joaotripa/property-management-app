import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getS3Client, STORAGE_BUCKET } from '@/lib/supabase/s3-client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { handlePropertyImageUpload, ImageServiceError } from '@/lib/services/imageService';
import { getPropertyImages, hasPropertyImages, bulkCreatePropertyImages, softDeleteAllPropertyImages } from '@/lib/db/propertyImages';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { prisma } from '@/lib/prisma';

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

    if (action === 'check') {
      const hasImages = await hasPropertyImages(propertyId);
      return NextResponse.json({ hasImages });
    }

    const images = await getPropertyImages(propertyId);

    if (images.length === 0) {
      return NextResponse.json({ imageUrls: [] });
    }

    // Format images for backwards compatibility
    const imageData = images.map(image => ({
      url: image.url,
      filename: image.filename,
      key: image.filename, // Use filename as key for backwards compatibility
      isCover: image.isCover
    }));

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

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Upload files to S3
    const results = await handlePropertyImageUpload(propertyId, files, coverImageIndex);

    // Get the highest existing sortOrder for this property
    const existingImages = await prisma.propertyImage.findMany({
      where: {
        propertyId,
        deletedAt: null,
      },
      select: {
        sortOrder: true,
      },
      orderBy: {
        sortOrder: 'desc',
      },
      take: 1,
    });

    const nextSortOrder = existingImages.length > 0 ? existingImages[0].sortOrder + 1 : 0;

    // Save image records to database
    const imagesToCreate = results.map((result, index) => ({
      filename: result.path.split('/').pop() || '',
      url: result.url,
      isCover: index === coverImageIndex,
      sortOrder: nextSortOrder + index,
    }));

    await bulkCreatePropertyImages({
      propertyId,
      images: imagesToCreate,
    });

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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: propertyId } = await params;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Verify the property belongs to the authenticated user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found or access denied' }, { status: 403 });
    }

    // Soft delete all images in database
    const result = await softDeleteAllPropertyImages(propertyId);

    // Optional: Also delete from S3 if needed (for complete cleanup)
    try {
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
    } catch (s3Error) {
      console.warn('Failed to delete some images from S3, but database records were updated:', s3Error);
      // Don't fail the request if S3 deletion fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} images`
    });
  } catch (error) {
    console.error('Delete all images API error:', error);
    return NextResponse.json({
      error: 'Delete operation failed'
    }, { status: 500 });
  }
}