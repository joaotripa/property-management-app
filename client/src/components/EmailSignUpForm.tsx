import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface EmailSignupFormProps {
  variant?: "primary" | "secondary";
  className?: string;
}

const EmailSignUpForm = ({
  variant = "primary",
  className = "",
}: EmailSignupFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        toast.success(
          "Welcome to Domari! You're on the list for early access."
        );
        setEmail("");
      } else if (data.status >= 400 && data.status < 500) {
        toast.warning(
          data.message || "Something went wrong. Please try again later."
        );
      } else {
        toast.error(
          data.message || "Something went wrong. Please try again later."
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.log("Waitlist Subscription Error:" + error);
      toast.error("Network error. Please try again later.");
    }
  };

  const isPrimary = variant === "primary";

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-3 max-w-md ${
        isPrimary ? "mx-auto lg:mx-0" : "mx-auto"
      } ${className}`}
    >
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`flex-1 h-12 px-4 text-slate-600 [&]:!bg-white ${
          isPrimary
            ? "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            : "border-white focus:border-blue-300 focus:ring-blue-300"
        }`}
        required
      />
      <Button
        type="submit"
        disabled={isLoading}
        className={`h-12 px-6 font-medium transition-all duration-200 hover:scale-105 ${
          isPrimary
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-white text-blue-600 hover:bg-blue-50"
        }`}
      >
        {isLoading ? "Signing up..." : "Get Early Access"}
        {isPrimary && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </form>
  );
};

export default EmailSignUpForm;
