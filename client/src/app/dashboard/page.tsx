"use client";

import { useRedirectIfSignedOut } from "@/hooks/use-redirect-if-signed-in-or-out";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  useRedirectIfSignedOut();
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }
  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }
  return (
    <div>
      <h1>DashboardPage</h1>
    </div>
  );
}
