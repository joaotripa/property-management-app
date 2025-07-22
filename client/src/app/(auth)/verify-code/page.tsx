"use client";

import { useRedirectIfSignedIn } from "@/hooks/use-redirect-if-signed-in";
import { useRouter, useSearchParams } from "next/navigation";
import { CodeVerification } from "@/components/auth/CodeVerification";
import { useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import { getClerkErrorMessage } from "@/lib/utils";
import { Suspense } from "react";
import AuthPageSkeleton from "@/components/auth/AuthPageSkeleton";

function VerifyCodeContent() {
  useRedirectIfSignedIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { signUp, isLoaded } = useSignUp();

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) {
      toast.error("Sign up is not ready. Please try again in a moment.");
      return;
    }
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("A new verification code has been sent to your email.");
    } catch (err: unknown) {
      toast.error(getClerkErrorMessage(err) || "Failed to resend code.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <CodeVerification
        email={email}
        mode="signup"
        onSuccess={() => {
          router.push("/dashboard");
        }}
        onResendCode={handleResendCode}
      />
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <VerifyCodeContent />
    </Suspense>
  );
}
