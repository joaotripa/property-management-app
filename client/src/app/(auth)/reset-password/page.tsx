import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResetPasswordForm from "@/app/(auth)/reset-password/ResetPasswordForm";

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    redirect("/forgot-password?error=invalid-token");
  }

  return <ResetPasswordForm />;
}
