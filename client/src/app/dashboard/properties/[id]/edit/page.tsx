import { auth } from "@/auth";
import { getPropertyById } from "@/lib/db/properties/queries";
import { getPropertyImages } from "@/lib/db/propertyImages/queries";
import { PropertyEditForm } from "@/components/dashboard/properties/edit/PropertyEditForm";
import { redirect, notFound } from "next/navigation";
import { canMutate } from "@/lib/stripe/server";

interface PropertyEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyEditPage({
  params,
}: PropertyEditPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [property, accessControl, propertyImages] = await Promise.all([
    getPropertyById(id, session.user.id),
    canMutate(session.user.id),
    getPropertyImages(id),
  ]);

  if (!property) {
    notFound();
  }

  if (!accessControl) {
    redirect(`/dashboard/properties/${id}`);
  }

  return (
    <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-bold">Edit Property</h2>
        <p className="text-muted-foreground">
          Update property details and images.
        </p>
      </div>

      <PropertyEditForm property={property} existingImages={propertyImages} />
    </div>
  );
}
