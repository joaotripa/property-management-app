// This file will contain Supabase database types
// Generate using: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'TOWNHOUSE' | 'VILLA' | 'COMMERCIAL' | 'OFFICE' | 'RETAIL' | 'WAREHOUSE' | 'MIXED_USE' | 'OTHER';

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string | null;
          purchase_price: number | null;
          type: PropertyType;
          rent: number;
          occupancy: string;
          tenants: number;
          user_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          purchase_price?: number | null;
          type?: PropertyType;
          rent?: number;
          occupancy?: string;
          tenants?: number;
          user_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          purchase_price?: number | null;
          type?: PropertyType;
          rent?: number;
          occupancy?: string;
          tenants?: number;
          user_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          name: string | null;
          phone: string | null;
          email_verified: string | null;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash?: string | null;
          name?: string | null;
          phone?: string | null;
          email_verified?: string | null;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string | null;
          name?: string | null;
          phone?: string | null;
          email_verified?: string | null;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}