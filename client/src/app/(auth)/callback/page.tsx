"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/dashboard");
    } else if (status === "unauthenticated") {
      router.replace("/login?message=oauth-error");
    }
  }, [status, session, router]);

  return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-4" />
      <p className="text-gray-600 mt-4">Processing authentication...</p>
    </div>
  );
}
