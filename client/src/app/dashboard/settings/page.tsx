"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/components/dashboard/settings/AccountSettings";
import { BillingSettings } from "@/components/dashboard/settings/BillingSettings";
import { PreferencesSettings } from "@/components/dashboard/settings/PreferencesSettings";
import { Loading } from "@/components/ui/loading";
import {
  useUserSettings,
  useCurrencies,
  useTimezones,
  useAccountInfo,
} from "@/hooks/queries/usePreferencesQueries";
import { useBillingData } from "@/hooks/queries/useBillingQueries";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("account");

  // Load all settings data in parallel
  const { data: userSettings, isLoading: userLoading, error: userError } = useUserSettings();
  const { data: currencies = [], isLoading: currenciesLoading, error: currenciesError } = useCurrencies();
  const { data: timezones = [], isLoading: timezonesLoading, error: timezonesError } = useTimezones();
  const { data: accountInfo, isLoading: accountLoading, error: accountError } = useAccountInfo();
  const { data: billingData, isLoading: billingLoading, error: billingError } = useBillingData();

  // Check if any data is still loading
  const isAnyLoading = userLoading || currenciesLoading || timezonesLoading || accountLoading || billingLoading;

  // Check if there are any errors
  const hasError = userError || currenciesError || timezonesError || accountError || billingError;

  useEffect(() => {
    if (tabParam === "billing" || tabParam === "account" || tabParam === "preferences") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Show loading state while any data is loading
  if (isAnyLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Show error state if any data failed to load
  if (hasError || !userSettings || !accountInfo || !billingData) {
    return (
      <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-bold">Settings</h2>
          <p className="text-muted-foreground text-destructive">
            Failed to load settings data. Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and billing preferences.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <AccountSettings accountInfo={accountInfo} />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesSettings
            userSettings={userSettings}
            currencies={currencies}
            timezones={timezones}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingSettings
            subscription={billingData.subscription}
            usage={billingData.usage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
