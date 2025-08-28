import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all active categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        type: category.type
      }))
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}