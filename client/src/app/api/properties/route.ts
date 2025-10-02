import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createProperty,
  getUserProperties,
  createPropertyRequestSchema,
  createPropertyResponseSchema,
  errorResponseSchema,
  propertyFiltersSchema
} from "@/lib/db/properties";
import { ZodError } from "zod";
import { withResourceLimit } from "@/lib/stripe/middleware/resourceLimit";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponseSchema.parse({
          success: false,
          message: "Authentication required",
        }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      type: searchParams.get("type") || undefined,
      occupancy: searchParams.get("occupancy") || undefined,
      minRent: searchParams.get("minRent") ? parseFloat(searchParams.get("minRent")!) : undefined,
      maxRent: searchParams.get("maxRent") ? parseFloat(searchParams.get("maxRent")!) : undefined,
      search: searchParams.get("search") || undefined,
    };

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined)
    );

    const validatedFilters = propertyFiltersSchema.parse(cleanFilters);
    
    const properties = await getUserProperties(session.user.id, validatedFilters);

    return NextResponse.json({
      success: true,
      message: "Properties retrieved successfully",
      properties,
      count: properties.length,
    });
  } catch (error) {
    console.error("GET /api/properties error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        errorResponseSchema.parse({
          success: false,
          message: "Invalid filter parameters",
          errors: error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      errorResponseSchema.parse({
        success: false,
        message: "Failed to retrieve properties",
      }),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponseSchema.parse({
          success: false,
          message: "Authentication required",
        }),
        { status: 401 }
      );
    }

    const body = await request.json();

    const validatedData = createPropertyRequestSchema.parse(body);

    const limitError = await withResourceLimit(session.user.id, 'properties');
    if (limitError) return limitError;

    const property = await createProperty(session.user.id, validatedData);

    const response = createPropertyResponseSchema.parse({
      success: true,
      message: "Property created successfully",
      property,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        errorResponseSchema.parse({
          success: false,
          message: "Invalid property data",
          errors: error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          errorResponseSchema.parse({
            success: false,
            message: "A property with this name already exists",
          }),
          { status: 409 }
        );
      }

      return NextResponse.json(
        errorResponseSchema.parse({
          success: false,
          message: error.message,
        }),
        { status: 500 }
      );
    }

    return NextResponse.json(
      errorResponseSchema.parse({
        success: false,
        message: "Failed to create property",
      }),
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    errorResponseSchema.parse({
      success: false,
      message: "Use /api/properties/[id] for updating specific properties",
    }),
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    errorResponseSchema.parse({
      success: false,
      message: "Use /api/properties/[id] for deleting specific properties",
    }),
    { status: 405 }
  );
}