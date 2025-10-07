"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Calendar } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isYearly: boolean;
  preview: {
    isUpgrade: boolean;
    currentPlan: string;
    newPlan: string;
    immediateChargeAmount: number;
    nextBillingDate: string;
    message: string;
  };
  onConfirm: () => Promise<void>;
}

export function SubscriptionChangeDialog({
  open,
  onOpenChange,
  isYearly,
  preview,
  onConfirm,
}: SubscriptionChangeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error confirming subscription change:", error);
      toast.error("Failed to update subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Confirm Subscription Change
          </DialogTitle>
          <DialogDescription>
            Review the details of your subscription change before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Change */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current Plan</p>
              <Badge variant="outline" className="font-semibold">
                {preview.currentPlan}
              </Badge>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-muted-foreground">New Plan</p>
              <Badge
                variant={preview.isUpgrade ? "default" : "secondary"}
                className="font-semibold"
              >
                {preview.newPlan}
              </Badge>
            </div>
          </div>

          {/* Billing Period */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
            <Calendar className="h-4 w-4" />
            <span>{isYearly ? "Annual" : "Monthly"} billing cycle</span>
          </div>

          {/* Charge Information */}
          {preview.isUpgrade ? (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Immediate Charge</span>
                <span className="text-2xl font-bold">
                  {formatPrice(preview.immediateChargeAmount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Includes prorated charge for upgrading to {preview.newPlan} for
                the remainder of your billing period.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Effective Date
                  </span>
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {preview.nextBillingDate}
                  </span>
                </div>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                  No immediate charge. Your plan will change at the end of your
                  current billing period.
                </p>
              </div>
            </div>
          )}

          {/* Additional Message */}
          <div className="p-3 bg-muted/30 rounded-md border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {preview.message}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Confirm Change"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
