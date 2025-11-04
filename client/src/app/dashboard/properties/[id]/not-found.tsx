import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function PropertyNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Property Not Found</h1>
          <p className="text-muted-foreground text-lg">
            The property you&apos;re looking for doesn&apos;t exist or you don&apos;t have
            permission to view it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href="/dashboard/properties">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
