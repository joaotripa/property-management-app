"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CreditCard, AlertTriangle, X } from "lucide-react";

interface SubscriptionStatus {
  status: string;
  plan: string;
  propertyLimit: number;
  trialEndsAt?: string;
  trialDaysRemaining?: number;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
}

type BannerType = 'trial-info' | 'trial-warning' | 'trial-expired' | 'limit-reached' | 'limit-warning';

const DISMISSAL_KEY = 'trial-banner-dismissed';

export function TrialBanner() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionDismissed = sessionStorage.getItem(DISMISSAL_KEY);
    if (sessionDismissed === 'true') {
      setDismissed(true);
    }

    fetchBillingStatus();
  }, []);

  const fetchBillingStatus = async () => {
    try {
      const response = await fetch('/api/billing/usage');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching billing status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSAL_KEY, 'true');
    setDismissed(true);
  };

  const handleUpgrade = () => {
    router.push('/dashboard/settings');
  };

  if (loading || !subscription) {
    return null;
  }

  const getBannerConfig = (): {
    type: BannerType;
    variant: 'default' | 'destructive';
    icon: React.ReactNode;
    title: string;
    description: string;
    badge: string;
    canDismiss: boolean;
    actionLabel: string;
  } | null => {
    const trialDays = subscription.trialDaysRemaining ?? 0;

    if (subscription.status === 'TRIAL') {
      if (trialDays === 0) {
        return {
          type: 'trial-expired',
          variant: 'destructive',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Your free trial expires today!',
          description: `Upgrade now to continue using all ${subscription.plan} plan features.`,
          badge: `${subscription.plan} Plan`,
          canDismiss: true,
          actionLabel: 'Upgrade Now',
        };
      } else if (trialDays <= 3) {
        return {
          type: 'trial-warning',
          variant: 'destructive',
          icon: <Clock className="h-4 w-4" />,
          title: `${trialDays} ${trialDays === 1 ? 'day' : 'days'} left in your free trial`,
          description: 'Upgrade to continue accessing all premium features after your trial ends.',
          badge: `${subscription.plan} Plan`,
          canDismiss: true,
          actionLabel: 'Upgrade Now',
        };
      }
    }

    return null;
  };

  const config = getBannerConfig();

  if (!config || (dismissed && config.canDismiss)) {
    return null;
  }

  return (
    <Alert
      variant={config.variant}
      className="sticky top-0 z-10 shadow-md"
    >
      {config.icon}
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{config.title}</span>
              <Badge variant={config.variant === 'destructive' ? 'destructive' : 'secondary'}>
                {config.badge}
              </Badge>
            </div>
            <span className="text-sm">{config.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={config.variant === 'destructive' ? 'default' : 'outline'}
            onClick={handleUpgrade}
          >
            <CreditCard className="h-3 w-3 mr-1" />
            {config.actionLabel}
          </Button>
          {config.canDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}