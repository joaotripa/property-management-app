"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { getAuthErrorMessage } from "@/lib/utils/index";
import { ErrorMessage } from "@/components/auth/ErrorMessage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupSchema,
  SignupInput,
  getPasswordStrength,
} from "@/lib/validations/auth";
import { Loading } from "@/components/ui/loading";
import { usePostHog } from "posthog-js/react";
import { trackEvent } from "@/lib/analytics/tracker";
import { AUTH_EVENTS } from "@/lib/analytics/events";

const SignupPage = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const posthog = usePostHog();

  useEffect(() => {
    trackEvent(posthog, AUTH_EVENTS.SIGNUP_STARTED, {
      method: "email",
    });
  }, [posthog]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const password = watch("password", "");
  const passwordStrength = password ? getPasswordStrength(password) : null;

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create account");
      }

      trackEvent(posthog, AUTH_EVENTS.SIGNUP_COMPLETED, {
        method: "email",
      });

      toast.success(
        "We've sent a verification code to your email. Please check your inbox and enter the code to verify your account."
      );
      router.push(`/verify-code?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err);
      setError("root", { message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      trackEvent(posthog, AUTH_EVENTS.SIGNUP_STARTED, {
        method: "google",
      });
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Google sign-up error:", err);
      toast.error("Google sign-up failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col gap-6">
        <Card className="rounded-2xl">
          <CardHeader className="text-center mt-6">
            <CardTitle className="text-3xl font-bold">
              Start tracking your rental finances
            </CardTitle>
          </CardHeader>
          <CardContent className="mb-4">
            <div className="grid gap-4">
              {errors.root && (
                <ErrorMessage
                  type="error"
                  message={errors.root.message || "An error occurred"}
                  className="mb-4"
                />
              )}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="rounded-2xl"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="rounded-2xl"
                        {...register("password")}
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
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordStrength && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              passwordStrength.score <= 2
                                ? "bg-destructive"
                                : passwordStrength.score <= 4
                                  ? "bg-orange-500"
                                  : passwordStrength.score <= 5
                                    ? "bg-yellow-500"
                                    : "bg-success"
                            }`}
                            style={{
                              width: `${(passwordStrength.score / 6) * 100}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${passwordStrength.color}`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="rounded-2xl"
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2  text-muted-foreground hover:text-secondary focus:outline-none"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="flex h-5 items-center">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="terms"
                          className="text-muted-foreground"
                        >
                          I agree to the{" "}
                          <Link
                            href="/terms-of-service"
                            className="font-medium text-accent hover:text-accent/70 transition-colors"
                            target="_blank"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy-policy"
                            className="font-medium text-accent hover:text-accent/70 transition-colors"
                            target="_blank"
                          >
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !acceptedTerms}
                    className="w-full rounded-2xl bg-primary/80 hover:bg-primary transition-colors"
                  >
                    {loading ? "Signing Up..." : "Sign Up"}
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
                    onClick={handleGoogleSignup}
                  >
                    <svg
                      viewBox="-3 0 262 262"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="xMidYMid"
                      fill="#000000"
                      className="mr-2 h-5 w-5"
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
          </CardContent>
        </Card>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 text-accent hover:text-accent/70 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </Suspense>
  );
};

export default SignupPage;
