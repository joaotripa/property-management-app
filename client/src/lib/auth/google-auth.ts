import { createClient } from "@/lib/supabase/client";

export const handleGoogleAuth = async (redirectTo: string = "/dashboard") => {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { 
      redirectTo: `${window.location.origin}/callback?next=${redirectTo}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    },
  });

  if (error) {
    throw error;
  }

  return data;
}; 