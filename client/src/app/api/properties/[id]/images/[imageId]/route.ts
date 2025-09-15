import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getS3Client, STORAGE_BUCKET, getPropertyImagePath } from '@/lib/supabase/s3-client';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@/lib/prisma';

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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: propertyId, imageId: filename } = await params;

    if (!propertyId || !filename) {
      return NextResponse.json({ error: 'Property ID and Image filename are required' }, { status: 400 });
    }

    // Find the image record in database by filename
    const imageRecord = await prisma.propertyImage.findFirst({
      where: {
        propertyId,
        filename,
        deletedAt: null,
      },
      include: {
        property: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!imageRecord) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Verify the property belongs to the authenticated user
    if (imageRecord.property.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Soft delete the image record in database
    await prisma.propertyImage.update({
      where: { id: imageRecord.id },
      data: {
        deletedAt: new Date(),
      },
    });

    // If this was the cover image, set another image as cover
    if (imageRecord.isCover) {
      const nextImage = await prisma.propertyImage.findFirst({
        where: {
          propertyId,
          deletedAt: null,
          id: { not: imageRecord.id },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      if (nextImage) {
        await prisma.propertyImage.update({
          where: { id: nextImage.id },
          data: { isCover: true },
        });
      }
    }

    // Delete from S3 storage (for cleanup, but not critical if it fails)
    try {
      const s3Client = getS3Client();
      const filePath = getPropertyImagePath(propertyId, filename);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: filePath,
      });

      await s3Client.send(deleteCommand);
    } catch (s3Error) {
      console.warn('Failed to delete image from S3, but database record was updated:', s3Error);
      // Don't fail the request if S3 deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete image API error:', error);
    return NextResponse.json({
      error: 'Delete operation failed'
    }, { status: 500 });
  }
}