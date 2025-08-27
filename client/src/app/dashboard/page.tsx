"use client";

/*import { useRedirectIfSignedOut } from "@/hooks/use-redirect-if-signed-in-or-out";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";*/

export default function DashboardPage() {
  /*useRedirectIfSignedOut();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="ml-3 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }*/

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/5 aspect-video rounded-xl" />
        <div className="bg-muted/5 aspect-video rounded-xl" />
        <div className="bg-muted/5 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/5 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  );
}
