"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSignIn } from "@clerk/nextjs";
import { useRedirectIfSignedIn } from "@/hooks/use-redirect-if-signed-in";
import { handleGoogleAuth } from "@/lib/utils";

export default function LoginPage() {
  useRedirectIfSignedIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // NEW
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const { signIn, setActive, isLoaded } = useSignIn();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  function renderAlertMessage(message: string | null) {
    if (!message) return null;
    if (message === "password-updated") {
      return (
        <div
          className="bg-green-100 text-green-800 border border-green-300 rounded-lg px-4 py-2 text-center text-sm mb-2"
          role="status"
        >
          Your password has been updated. Please log in with your new password.
        </div>
      );
    }
    if (message === "oauth-error") {
      return (
        <div
          className="bg-red-100 text-red-800 border border-red-300 rounded-lg px-4 py-2 text-center text-sm mb-2"
          role="alert"
        >
          Google sign-in failed. Please try again or use another login method.
        </div>
      );
    }
    return (
      <div
        className="bg-blue-100 text-blue-800 border border-blue-300 rounded-lg px-4 py-2 text-center text-sm mb-2"
        role="status"
      >
        {message}
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous error
    if (!signIn) {
      const msg = "Login is not ready. Please try again in a moment.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Welcome back! Redirecting to your dashboard.");
        router.push("/dashboard");
      } else {
        const msg = "Invalid email or password. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg =
        err.errors?.[0]?.message ||
        err.message ||
        "Something went wrong. Please try again later.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await handleGoogleAuth({ signIn, setLoading, toast });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-2xl">
        <CardHeader className="text-center mt-6">
          <CardTitle className="font-bold text-3xl">
            Welcome to Domari
          </CardTitle>
        </CardHeader>
        <CardContent className="mb-4">
          <div className="grid gap-4">
            {renderAlertMessage(message)}
            {error && (
              <p className="text-red-500 text-center" role="alert">
                {error}
              </p>
            )}
            <form onSubmit={handleLogin}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="rounded-2xl"
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline hover:text-blue-600 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-2xl"
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
                <Button
                  type="submit"
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 transition-colors"
                  disabled={loading || !email || !password}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl"
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                >
                  <svg
                    viewBox="-3 0 262 262"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                    fill="#000000"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                        fill="#4285F4"
                      ></path>
                      <path
                        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                        fill="#34A853"
                      ></path>
                      <path
                        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                        fill="#FBBC05"
                      ></path>
                      <path
                        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                        fill="#EB4335"
                      ></path>
                    </g>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </form>
          </div>
          <div className="grid gap-6 mt-6">
            <div className="text-muted-foreground *:[a]:text-blue-600 *:[a]:hover:text-blue-800 text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 transition-colors">
              By signing up, you acknowledge that you have read and understood,
              and agree to our <Link href="#">Terms of Service</Link> and{" "}
              <Link href="#">Privacy Policy</Link>.
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="underline underline-offset-4 text-blue-700 hover:text-blue-500 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
