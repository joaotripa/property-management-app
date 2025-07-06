"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../actions";
import type { AuthResult } from "../actions";
import { handleGoogleAuth } from "@/lib/auth/google-auth";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function isSignupError(result: AuthResult): result is { error: string } {
    return "error" in result;
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    const result: AuthResult = await signup({ email, password });
    setLoading(false);
    if (isSignupError(result)) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    try {
      await handleGoogleAuth("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Failed to sign up with Google");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Start tracking your rental finances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <div className="grid gap-6">
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
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-gray-600">
                        I agree to the{" "}
                        <Link
                          href="/legal/terms"
                          className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                          target="_blank"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/legal/privacy"
                          className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                          target="_blank"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>
                </div>
                {error && (
                  <span className="bg-red-100 text-red-700 text-sm p-2 rounded-md block mt-2">
                    {error}
                  </span>
                )}
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !acceptedTerms ||
                    !email ||
                    !password ||
                    !confirmPassword
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={handleGoogleRegister}
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
            </div>
          </form>
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
        <span className="text-gray-600">Already have an account?</span>{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 text-blue-700 hover:text-blue-500 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
