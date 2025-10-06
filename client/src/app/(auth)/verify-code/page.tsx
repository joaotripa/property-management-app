"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CodeVerification } from "@/components/auth/CodeVerification";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/utils/index";
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";

function VerifyCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleResendCode = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("A new verification code has been sent to your email.");
      } else {
        toast.error(data.error || "Failed to resend code.");
      }
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err) || "Failed to resend code.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <CodeVerification
        email={email}
        mode="signup"
        onSuccess={async (code) => {
          try {
            const response = await fetch("/api/auth/verify-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Verification failed");
            }

            toast.success("Email verified successfully! You can now sign in.");
            router.push("/login?message=email-verified");
          } catch (err: unknown) {
            toast.error(getAuthErrorMessage(err));
          }
        }}
        onResendCode={handleResendCode}
      />
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loading />
        </div>
      }
    >
      <VerifyCodeContent />
    </Suspense>
  );
}
