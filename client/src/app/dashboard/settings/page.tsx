"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
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

  const {
    data: userSettings,
    isLoading: userLoading,
    error: userError,
  } = useUserSettings();
  const {
    data: currencies = [],
    isLoading: currenciesLoading,
    error: currenciesError,
  } = useCurrencies();
  const {
    data: timezones = [],
    isLoading: timezonesLoading,
    error: timezonesError,
  } = useTimezones();
  const {
    data: accountInfo,
    isLoading: accountLoading,
    error: accountError,
  } = useAccountInfo();
  const {
    data: billingData,
    isLoading: billingLoading,
    error: billingError,
  } = useBillingData();

  const isAnyLoading =
    userLoading ||
    currenciesLoading ||
    timezonesLoading ||
    accountLoading ||
    billingLoading;

  const hasError =
    userError ||
    currenciesError ||
    timezonesError ||
    accountError ||
    billingError;

  useEffect(() => {
    if (
      tabParam === "billing" ||
      tabParam === "account" ||
      tabParam === "preferences"
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  if (isAnyLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (hasError || !userSettings || !accountInfo || !billingData) {
    return (
      <div className="flex flex-col gap-8 px-6 pb-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-bold">Settings</h2>
          <p className="text-muted-foreground">
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

      <div className="space-y-6">
        <ButtonGroup className="grid w-full grid-cols-3 max-w-lg">
          <Button
            variant={activeTab === "account" ? "default" : "outline"}
            onClick={() => setActiveTab("account")}
          >
            Account
          </Button>
          <Button
            variant={activeTab === "preferences" ? "default" : "outline"}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </Button>
          <Button
            variant={activeTab === "billing" ? "default" : "outline"}
            onClick={() => setActiveTab("billing")}
          >
            Billing
          </Button>
        </ButtonGroup>

        <div className="space-y-6">
          {activeTab === "account" && (
            <AccountSettings accountInfo={accountInfo} />
          )}

          {activeTab === "preferences" && (
            <PreferencesSettings
              userSettings={userSettings}
              currencies={currencies}
              timezones={timezones}
            />
          )}

          {activeTab === "billing" && (
            <BillingSettings subscription={billingData.subscription} />
          )}
        </div>
      </div>
    </div>
  );
}
