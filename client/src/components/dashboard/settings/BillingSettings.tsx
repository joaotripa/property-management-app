"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillingPricingCards } from "@/components/billing/BillingPricingCards";
import { toast } from "sonner";
import { Loader2, CreditCard, Calendar, Users } from "lucide-react";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { SubscriptionData, Usage } from "@/hooks/queries/useBillingQueries";

interface BillingSettingsProps {
  subscription: SubscriptionData;
  usage: Usage;
}

export function BillingSettings({ subscription, usage }: BillingSettingsProps) {
  const [loading, setLoading] = useState(false);

  const handlePlanSelect = async (plan: SubscriptionPlan, isYearly: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          isYearly,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create checkout session');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to open billing portal');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'TRIAL':
        return <Badge variant="secondary">Free Trial</Badge>;
      case 'ACTIVE':
        return <Badge variant="default">Active</Badge>;
      case 'PAST_DUE':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'CANCELED':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Subscription
              {getStatusBadge(subscription.status)}
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{subscription.plan} Plan</p>
                  <p className="text-xs text-muted-foreground">
                    {usage.propertyCount} of {subscription.propertyLimit} properties
                  </p>
                </div>
              </div>

              {subscription.trialDaysRemaining !== null && subscription.status === 'TRIAL' && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Trial Expires</p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.trialDaysRemaining} days remaining
                    </p>
                  </div>
                </div>
              )}

              {subscription.currentPeriodEnd && subscription.status === 'ACTIVE' && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Next Billing</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                <span>Manage Billing</span>
              </Button>

              {subscription.status === 'TRIAL' && (
                <p className="text-sm text-muted-foreground">
                  Upgrade to continue using Domari after your trial ends
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your property portfolio needs. You can upgrade or downgrade at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillingPricingCards
            currentPlan={subscription.plan}
            currentStatus={subscription.status}
            onPlanSelect={handlePlanSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}