import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface ErrorMessageProps {
  type?: "error" | "success" | "info";
  message: string;
  className?: string;
}

export function ErrorMessage({
  type = "error",
  message,
  className = "",
}: ErrorMessageProps) {
  const config = {
    error: {
      icon: AlertCircle,
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
      iconColor: "text-destructive",
      textColor: "text-destructive",
    },
    success: {
      icon: CheckCircle,
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
      iconColor: "text-success",
      textColor: "text-success",
    },
    info: {
      icon: Info,
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      iconColor: "text-primary",
      textColor: "text-primary",
    },
  };

  const { icon: Icon, ...colors } = config[type];

  return (
    <div
      className={`
        relative rounded-xl border p-4 shadow-sm transition-all duration-200
        ${colors.bgColor} ${colors.borderColor} ${className}
      `}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${colors.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm ${colors.textColor} leading-relaxed`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

// Utility function to get error message configuration
export function getErrorMessageConfig(message: string | null) {
  if (!message) return null;

  switch (message) {
    case "password-updated":
      return {
        type: "success" as const,
        message:
          "Your password has been updated successfully. Please log in with your new password.",
      };
    case "oauth-error":
      return {
        type: "error" as const,
        message:
          "Google sign-in failed. Please try again or use another login method.",
      };
    case "email-verified":
      return {
        type: "success" as const,
        message:
          "Your email has been successfully verified. You can now log in to your account.",
      };
    case "verification-sent":
      return {
        type: "info" as const,
        message:
          "Please check your email and click the verification link to activate your account.",
      };
    case "reset-sent":
      return {
        type: "info" as const,
        message:
          "A password reset link has been sent to your email address. Please check your inbox.",
      };
    case "invalid-token":
      return {
        type: "error" as const,
        message:
          "The verification link is invalid or has expired. Please request a new one.",
      };
    default:
      return {
        type: "info" as const,
        message: message,
      };
  }
}
