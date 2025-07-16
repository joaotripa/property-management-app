"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useSignIn } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { getClerkErrorMessage } from "@/lib/utils";
import { useRedirectIfSignedIn } from "@/hooks/use-redirect-if-signed-in";
import { CodeVerification } from "@/components/auth/CodeVerification";

export default function ResetPasswordPage() {
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
  const { signIn, isLoaded } = useSignIn();
  const { signOut } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

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
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
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
      toast.error("Passwords don&apos;t match");
      setLoading(false);
      return;
    }
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: verifiedCode,
        password,
      });

      if (result.status === "complete") {
        try {
          await signOut();
        } catch (signOutErr) {
          // Log or toast sign out error, but continue
          console.error("Sign out error after password reset", signOutErr);
        }
        toast.success(
          "Password updated successfully! Please log in with your new password."
        );
        router.push("/login?message=password-updated");
      } else if (result.status === "needs_second_factor") {
        toast.error(
          "Two-factor authentication is required but not supported in this flow."
        );
      } else {
        toast.error("An error occurred. Please check your code and try again.");
      }
    } catch (err: unknown) {
      toast.error(getClerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn) {
      toast.error("Password reset is not ready. Please try again in a moment.");
      return;
    }
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      toast.success("Verification code resent to your email.");
    } catch (err: any) {
      toast.error(
        err.errors?.[0]?.longMessage ||
          err.message ||
          "We couldn't process your request. Please try again later."
      );
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
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
          className="underline underline-offset-4 text-blue-700 hover:text-blue-500 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
