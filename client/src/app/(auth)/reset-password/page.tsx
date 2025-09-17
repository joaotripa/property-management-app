"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { getAuthErrorMessage } from "@/lib/utils";
import { useRedirectIfSignedIn } from "@/hooks/useRedirectIfSignedIn";
import { CodeVerification } from "@/components/auth/CodeVerification";
import { Suspense } from "react";
import AuthPageSkeleton from "@/components/auth/AuthPageSkeleton";

function ResetPasswordContent() {
  useRedirectIfSignedIn();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Missing Email Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground">
              Oops! We couldn&apos;t find your email address for this password
              reset. Please restart the password reset process again so we can
              send you a secure code.
            </p>
            <Button
              asChild
              className="w-full bg-primary/80 hover:bg-primary transition-colors"
            >
              <Link href="/forgot-password">Restart Password Reset</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verifiedCode, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      toast.success(
        "Password updated successfully! Please log in with your new password."
      );
      router.push("/login?message=password-updated");
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Verification code resent to your email.");
      } else {
        toast.error("Failed to resend code. Please try again.");
      }
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!codeVerified ? (
        <CodeVerification
          email={email}
          mode="reset"
          onSuccess={(code) => {
            setCodeVerified(true);
            setVerifiedCode(code);
          }}
          onResendCode={handleResendCode}
        />
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Set new password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary focus:outline-none"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary focus:outline-none"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary/80 hover:bg-primary transition-colors"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Set New Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="text-center text-sm">
        <Link
          href="/login"
          className="underline underline-offset-4 text-accent hover:text-accent/70 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
