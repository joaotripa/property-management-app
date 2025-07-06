"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ForgotPasswordContent = () => {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "invalid-token") {
      setError(
        "The password reset link is invalid or has expired. Please request a new one."
      );

      // Auto-hide error after 30 seconds
      const timer = setTimeout(() => {
        setError(null);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(30);
  };

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      setSuccess(true);
      startCountdown();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      startCountdown();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {success
              ? "Check your email"
              : "Enter your email to reset your password"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                If an account exists for {email}, you will get an email with
                instructions on resetting your password. If it doesn&apos;t
                arrive, be sure to check your spam folder.
              </p>
              <Button
                onClick={handleResend}
                className="mt-4 bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={countdown > 0}
              >
                {countdown > 0 ? `Resend (${countdown})` : "Resend"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <span className="bg-red-100 text-red-700 text-sm p-2 rounded-md block">
                    {error}
                  </span>
                )}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Sending Reset Email..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
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
};

const ForgotPassword = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
};

export default ForgotPassword;
