import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/upload/image - Upload image to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Create Supabase service client for storage operations
    const supabase = createServiceSupabaseClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'property-images';
    const customPath = formData.get('path') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed" 
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File size too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Generate file path
    const fileExtension = file.name.split('.').pop();
    const fileName = customPath || `${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: error.message || "Failed to upload file" 
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: publicUrlData.publicUrl,
      path: data.path,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Upload failed" 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/upload/image - Delete image from Supabase Storage
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Create Supabase service client for storage operations
    const supabase = createServiceSupabaseClient();

    const { path, bucket = 'property-images' } = await request.json();

    if (!path) {
      return NextResponse.json(
        { success: false, message: "File path is required" },
        { status: 400 }
      );
    }

    // Verify the file belongs to the user (check if path starts with user ID)
    if (!path.startsWith(session.user.id)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: error.message || "Failed to delete file" 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });

  } catch (error) {
    console.error("Delete API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Delete failed" 
      },
      { status: 500 }
    );
  }
}