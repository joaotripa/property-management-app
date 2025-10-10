import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { handlePropertyImageUpload } from '@/lib/services/server/imageService';
import { ImageServiceError, STORAGE_BUCKET } from '@/lib/services/shared/imageUtils';
import { getPropertyImages, hasPropertyImages, bulkCreatePropertyImages, softDeleteAllPropertyImages } from '@/lib/db/propertyImages';
import { createServiceSupabaseClient } from '@/lib/integrations/supabase/server';
import { prisma } from '@/lib/config/database';

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
      return NextResponse.json({ images: [], imageUrls: [] });
    }

    // Provide both formats for backwards compatibility
    const imageUrls = images.map(image => image.url);

    return NextResponse.json({
      images, // Full PropertyImage objects
      imageUrls // URLs only for backwards compatibility
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const { id: propertyId } = await params;
    const coverImageIndex = parseInt(formData.get('coverImageIndex') as string) || 0;

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

    const files: File[] = [];
    formData.forEach((value, key) => {
      if (key.startsWith('file-') && value instanceof File) {
        files.push(value);
      }
    });

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Upload files to Supabase Storage
    const results = await handlePropertyImageUpload(propertyId, files);

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

    // Also delete from Supabase Storage for complete cleanup
    try {
      const supabase = createServiceSupabaseClient();

      // List all files in the property folder
      const { data: files } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(`${propertyId}/`);

      if (files && files.length > 0) {
        // Delete all files in the property folder
        const filePaths = files.map(file => `${propertyId}/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(filePaths);

        if (deleteError) {
          console.warn('Failed to delete some images from Supabase Storage:', deleteError);
        }
      }
    } catch (storageError) {
      console.warn('Failed to delete some images from Supabase Storage, but database records were updated:', storageError);
      // Don't fail the request if storage deletion fails
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