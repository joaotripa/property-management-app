"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingCards } from "@/components/pricing/PricingCards";
import { Plan } from "@/components/pricing/types";
import { toast } from "sonner";
import { CreditCard, Zap } from "lucide-react";

interface UpgradePromptProps {
  children?: React.ReactNode;
  reason?: string;
  currentPlan?: string;
  showAsDialog?: boolean;
}

export function UpgradePrompt({
  children,
  reason = "Upgrade to unlock more features",
  currentPlan = "STARTER",
  showAsDialog = true,
}: UpgradePromptProps) {
  const [open, setOpen] = useState(false);

  const handlePlanSelect = async (plan: Plan, isYearly: boolean) => {
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan.name.toUpperCase(),
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
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Upgrade Your Plan</h3>
          <p className="text-sm text-muted-foreground">{reason}</p>
          {currentPlan && (
            <Badge variant="outline">Current: {currentPlan} Plan</Badge>
          )}
        </div>
      </div>

      <PricingCards
        showToggle={true}
        showDisclaimer={false}
        onPlanSelect={handlePlanSelect}
        className="max-w-4xl mx-auto"
      />
    </div>
  );

  if (!showAsDialog) {
    return content;
  }

  const trigger = children || (
    <Button variant="outline" size="sm">
      <CreditCard className="h-3 w-3 mr-1" />
      Upgrade
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>Choose a plan that fits your needs</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}