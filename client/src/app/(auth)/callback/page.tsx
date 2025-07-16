"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    async function processCallback() {
      try {
        await handleRedirectCallback({
          signInForceRedirectUrl: "/dashboard",
          signUpForceRedirectUrl: "/dashboard",
        });
      } catch (err) {
        console.log(err);
        router.replace("/login?message=oauth-error");
      }
    }
    if (isLoaded) {
      processCallback();
    }
  }, [isLoaded, handleRedirectCallback, router]);

  return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-4" />
      <span className="text-blue-600 mb-4">Signing you in with Google...</span>
    </div>
  );
}
