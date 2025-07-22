"use client";
import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRedirectIfSignedIn } from "@/hooks/use-redirect-if-signed-in";
import { getClerkErrorMessage } from "@/lib/utils";

const ForgotPasswordPage = () => {
  useRedirectIfSignedIn();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  async function handleSendResetEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      toast.success(
        "We've sent a password reset code to your email. Please check your inbox."
      );
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
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
              <Button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Sending Reset Email..." : "Send Reset Email"}
              </Button>
              {error && <p className="text-red-500 text-center">{error}</p>}
            </div>
          </form>
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

export default ForgotPasswordPage;
