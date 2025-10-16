"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import {
  useCurrencies,
  useTimezones,
  useUpdateUserSettings,
} from "@/hooks/queries/usePreferencesQueries";
import {
  UserSettingsFormInput,
  userSettingsFormSchema,
} from "@/lib/validations/userSettings";
import { usePostHog } from "posthog-js/react";
import { trackEvent } from "@/lib/analytics/tracker";
import { ONBOARDING_EVENTS } from "@/lib/analytics/events";
import { useEffect } from "react";

interface OnboardingPreferencesDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingPreferencesDialog({
  isOpen,
  onComplete,
}: OnboardingPreferencesDialogProps) {
  const posthog = usePostHog();

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

  const updateMutation = useUpdateUserSettings();

  useEffect(() => {
    if (isOpen) {
      trackEvent(posthog, ONBOARDING_EVENTS.ONBOARDING_STARTED);
    }
  }, [isOpen, posthog]);

  const onSubmit = async (data: UserSettingsFormInput) => {
    const selectedCurrency = currencies.find((c) => c.id === data.currencyId);
    const selectedTimezone = timezones.find((t) => t.id === data.timezoneId);

    updateMutation.mutate(
      {
        currencyId: data.currencyId,
        timezoneId: data.timezoneId,
      },
      {
        onSuccess: () => {
          trackEvent(posthog, ONBOARDING_EVENTS.ONBOARDING_COMPLETED, {
            currency: selectedCurrency?.code || "unknown",
            timezone: selectedTimezone?.iana || "unknown",
          });
          onComplete();
        },
      }
    );
  };

  const isDataLoading = currenciesLoading || timezonesLoading;
  const isSubmitting = updateMutation.isPending;

  const hasError = currenciesError || timezonesError;

  if (hasError) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}} modal>
        <DialogContent
          className="sm:max-w-lg"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="text-center">
            <DialogTitle className="flex items-center justify-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Welcome to Domari!
            </DialogTitle>
            <DialogDescription className="text-center mt-4">
              We&apos;re having trouble loading your setup options. Please
              refresh the page and try again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            🎉 Welcome to Domari!
          </DialogTitle>
          <DialogDescription className="text-center mt-4 text-base leading-relaxed">
            Your 14-day free trial starts right now — enjoy full access to all
            features! Before we jump in, let&apos;s quickly set up your currency
            and timezone so everything displays in a way that makes sense for
            you.
            <br />
            <br />
            <span className="text-sm text-muted-foreground">
              You can always change these later in your account settings.
            </span>
          </DialogDescription>
        </DialogHeader>

        {isDataLoading ? (
          <div className="py-8">
            <Loading />
          </div>
        ) : (
          <OnboardingForm
            currencies={currencies}
            timezones={timezones}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function OnboardingForm({
  currencies,
  timezones,
  onSubmit,
  isSubmitting,
}: {
  currencies: Array<{ id: string; code: string; name: string }>;
  timezones: Array<{ id: string; iana: string; label: string }>;
  onSubmit: (data: UserSettingsFormInput) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<UserSettingsFormInput>({
    resolver: zodResolver(userSettingsFormSchema),
    defaultValues: {
      currencyId: currencies.find((c) => c.code === "EUR")?.id || "",
      timezoneId: timezones.find((t) => t.iana === "Europe/London")?.id || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <div className="space-y-6">
          {/* Currency Selection */}
          <FormField
            control={form.control}
            name="currencyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base">
                  Choose your currency
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        <div className="flex items-center gap-1">
                          {currency.name}
                          <span className="text-sm">({currency.code})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This will be used for displaying amounts throughout the
                  application.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* Timezone Selection */}
          <FormField
            control={form.control}
            name="timezoneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base">
                  Choose your timezone
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone.id} value={timezone.id}>
                        <div className="flex flex-col">{timezone.label}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This will be used for displaying dates and times throughout
                  the application.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !form.formState.isValid}
            className="w-full h-12 text-base font-semibold"
          >
            {isSubmitting
              ? "Setting up your account..."
              : "Continue & Get Started"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
