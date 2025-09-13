"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/components/dashboard/settings/AccountSettings";
import { BillingSettings } from "@/components/dashboard/settings/BillingSettings";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    if (tabParam === "billing" || tabParam === "account") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and billing preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          <AccountSettings />
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-6">
          <BillingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}