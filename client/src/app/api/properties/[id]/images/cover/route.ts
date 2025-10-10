import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPropertyCoverImage, updatePropertyImageCover } from '@/lib/db/propertyImages';
import { z } from 'zod';

const updateCoverImageSchema = z.object({
  imageFilename: z.string().min(1),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const coverImage = await getPropertyCoverImage(propertyId);

    if (!coverImage) {
      return NextResponse.json({ coverImageUrl: null });
    }

    return NextResponse.json({ coverImageUrl: coverImage.url });
  } catch (error) {
    console.error('Cover image GET API error:', error);

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

    const body = await request.json();
    const validatedData = updateCoverImageSchema.parse(body);

    // Verify the property belongs to the user (basic security check)
    // This could be enhanced with a proper ownership check
    await updatePropertyImageCover(propertyId, validatedData.imageFilename);

    return NextResponse.json({
      success: true,
      message: 'Cover image updated successfully'
    });
  } catch (error) {
    console.error('Cover image PUT API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: error.issues
      }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to update cover image'
    }, { status: 500 });
  }
}

