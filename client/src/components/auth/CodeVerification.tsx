"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircleCheckBig } from "lucide-react";
import { toast } from "sonner";
import { useSignUp, useSignIn } from "@clerk/nextjs";
import { getClerkErrorMessage } from "@/lib/utils";

interface CodeVerificationProps {
  email: string;
  mode: "signup" | "reset";
  onSuccess: (code: string) => void;
  onResendCode?: () => Promise<void>;
  resendLoading?: boolean;
  resendTimer?: number;
}

export function CodeVerification({
  email,
  mode,
  onSuccess,
  onResendCode,
  resendLoading = false,
}: CodeVerificationProps) {
  const { signUp, setActive, isLoaded: signUpLoaded } = useSignUp();
  const { isLoaded: signInLoaded } = useSignIn();
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const codeInputs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [internalResendTimer, setInternalResendTimer] = useState(30);

  useEffect(() => {
    if (internalResendTimer > 0) {
      const timer = setTimeout(
        () => setInternalResendTimer(internalResendTimer - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [internalResendTimer]);

  const handleResend = async () => {
    if (onResendCode) {
      await onResendCode();
      setInternalResendTimer(30);
    }
  };

  const handleDigitChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...codeDigits];
    newDigits[idx] = value;
    setCodeDigits(newDigits);
    if (value && idx < 5) {
      codeInputs[idx + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");
    if (/^[0-9]{6}$/.test(paste)) {
      setCodeDigits(paste.split(""));
      codeInputs[5].current?.focus();
      e.preventDefault();
    }
  };

  const handleDigitKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !codeDigits[idx] && idx > 0) {
      codeInputs[idx - 1].current?.focus();
    }
  };

  const code = codeDigits.join("");

  if (
    (mode === "reset" && !signInLoaded) ||
    (mode !== "reset" && !signUpLoaded)
  ) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "reset") {
      setLoading(false);
      onSuccess(code);
      return;
    }
    if (!signUp) {
      toast.error("Sign up is not ready. Please try again in a moment.");
      setLoading(false);
      return;
    }
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success(
          "Your email has been verified! Welcome to your dashboard."
        );
        onSuccess(code);
      } else {
        toast.error("Invalid code. Please try again.");
      }
    } catch (err: unknown) {
      const errorMessage = getClerkErrorMessage(err);
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const effectiveResendLoading = resendLoading;
  const effectiveResendTimer = internalResendTimer;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex justify-center gap-3 text-3xl font-bold">
          <CircleCheckBig size={40} color="#00A53D" />
          Check your email
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              {mode === "reset" ? (
                <>
                  Enter the code sent to <strong>{email}</strong> to reset your
                  password.
                </>
              ) : (
                <>
                  Enter the code sent to <strong>{email}</strong> to verify your
                  account.
                </>
              )}
            </p>
          </div>
          <div className="flex justify-center gap-2">
            {codeDigits.map((digit, idx) => (
              <Input
                key={idx}
                ref={codeInputs[idx]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="w-12 h-12 text-center text-xl tracking-widest"
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                onPaste={handlePaste}
                autoFocus={idx === 0}
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <div className="text-center">
            {effectiveResendLoading ? (
              <span className="text-sm text-gray-500">Resending...</span>
            ) : effectiveResendTimer > 0 ? (
              <span className="text-sm text-gray-500">
                Resend code ({effectiveResendTimer})
              </span>
            ) : (
              <span
                className="text-sm text-blue-600 hover:underline cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={handleResend}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleResend();
                }}
              >
                Resend code
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
