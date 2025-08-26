"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircleCheckBig } from "lucide-react";
import { getAuthErrorMessage } from "@/lib/utils";
import { ErrorMessage } from "./ErrorMessage";

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "reset") {
      setLoading(false);
      onSuccess(code);
      return;
    }

    try {
      await onSuccess(code);
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err);
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
          {error && (
            <ErrorMessage type="error" message={error} className="mb-4" />
          )}
          <Button
            type="submit"
            className="w-full bg-primary/80 hover:bg-primary transition-colors"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <div className="text-center">
            {effectiveResendLoading ? (
              <span className="text-sm text-muted-foreground">
                Resending...
              </span>
            ) : effectiveResendTimer > 0 ? (
              <span className="text-sm text-muted-foreground">
                Resend code ({effectiveResendTimer})
              </span>
            ) : (
              <span
                className="text-sm text-accent hover:underline cursor-pointer"
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
