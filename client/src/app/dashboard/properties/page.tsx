import { auth } from "@/auth";
import { getPropertiesData } from "@/lib/services/server/propertiesService";
import { PropertiesClient } from "@/components/dashboard/properties/PropertiesClient";
import PropertiesStats from "@/components/dashboard/properties/PropertiesStats";
import { UserSettingsService } from "@/lib/services/server/userSettingsService";
import { redirect } from "next/navigation";

export default async function PropertiesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all data server-side
  const [
    { properties, stats },
    userCurrencyCode
  ] = await Promise.all([
    getPropertiesData(session.user.id),
    UserSettingsService.getUserCurrency(session.user.id)
  ]);

  return (
    <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-bold">Properties</h2>
        <p className="text-muted-foreground">
          Think of this as your property shelf. Add, update, or tidy it up
          anytime.
        </p>
      </div>

      <PropertiesStats stats={stats} currencyCode={userCurrencyCode} />

      <PropertiesClient properties={properties} />
    </div>
  );
}
