"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRedirectIfSignedIn } from "@/hooks/useRedirectIfSignedIn";
import { getAuthErrorMessage } from "@/lib/utils/index";
import { ErrorMessage } from "@/components/auth/ErrorMessage";

const ForgotPasswordPage = () => {
  useRedirectIfSignedIn();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSendResetEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      toast.success(
        "We've sent a password reset code to your email. Please check your inbox."
      );
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Reset your password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendResetEmail}>
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
                  className="rounded-2xl"
                />
              </div>
              {error && (
                <ErrorMessage type="error" message={error} className="mb-4" />
              )}
              <Button
                type="submit"
                className="w-full rounded-2xl bg-primary/80 hover:bg-primary transition-colors"
                disabled={loading}
              >
                {loading ? "Sending Reset Email..." : "Send Reset Email"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
};

export default ForgotPasswordPage;
