import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { 
  deleteProperty, 
  getPropertyById,
  updateProperty,
  errorResponseSchema 
} from "@/lib/db/properties";
import { updatePropertySchema } from "@/lib/validations/property";
import { ZodError } from "zod";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = await params;

    const property = await getPropertyById(id, session.user.id);

    if (!property) {
      return NextResponse.json(
        errorResponseSchema.parse({
          success: false,
          message: "Property not found",
        }),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Property retrieved successfully",
      property,
    });
  } catch (error) {
    console.error("GET /api/properties/[id] error:", error);
    
    return NextResponse.json(
      errorResponseSchema.parse({
        success: false,
        message: "Failed to retrieve property",
      }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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
    const { id } = await params;

    const validatedData = updatePropertySchema.parse({
      ...body,
      id,
    });
        
    const property = await updateProperty(session.user.id, validatedData);

    return NextResponse.json({
      success: true,
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("PUT /api/properties/[id] error:", error);

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
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return NextResponse.json(
          errorResponseSchema.parse({
            success: false,
            message: "Property not found or access denied",
          }),
          { status: 404 }
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
        message: "Failed to update property",
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = await params;

    await deleteProperty(id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return NextResponse.json(
          errorResponseSchema.parse({
            success: false,
            message: "Property not found or access denied",
          }),
          { status: 404 }
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
        message: "Failed to delete property",
      }),
      { status: 500 }
    );
  }
}