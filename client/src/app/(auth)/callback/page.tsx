"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loading } from "@/components/ui/loading";

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

  return <Loading loadingText="Processing authentication..." />;
}
