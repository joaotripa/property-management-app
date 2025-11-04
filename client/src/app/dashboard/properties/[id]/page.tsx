import { auth } from "@/auth";
import { getPropertyById } from "@/lib/db/properties/queries";
import { PropertyDetailsClient } from "@/components/dashboard/properties/PropertyDetailsClient";
import { redirect, notFound } from "next/navigation";
import { canMutate } from "@/lib/stripe/server";

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [property, accessControl] = await Promise.all([
    getPropertyById(id, session.user.id),
    canMutate(session.user.id),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
      <PropertyDetailsClient
        initialProperty={property}
        canMutate={accessControl}
      />
    </div>
  );
}
