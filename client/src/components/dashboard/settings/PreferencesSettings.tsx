"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Settings } from "lucide-react";
import {
  useUserSettings,
  useCurrencies,
  useTimezones,
  useUpdateUserSettings,
} from "@/hooks/queries/usePreferencesQueries";
import {
  UserSettingsFormInput,
  userSettingsFormSchema,
} from "@/lib/validations/userSettings";

export function PreferencesSettings() {
  const { data: userSettings, error: userSettingsError } = useUserSettings();

  const { data: currencies = [], error: currenciesError } = useCurrencies();

  const { data: timezones = [], error: timezonesError } = useTimezones();

  const updateMutation = useUpdateUserSettings();

  const form = useForm<UserSettingsFormInput>({
    resolver: zodResolver(userSettingsFormSchema),
    defaultValues: {
      currencyId: "",
      timezoneId: "",
    },
  });

  // Update form when user settings are loaded
  useEffect(() => {
    if (userSettings) {
      form.reset({
        currencyId: userSettings.currencyId,
        timezoneId: userSettings.timezoneId,
      });
    }
  }, [userSettings, form]);

  const onSubmit = async (data: UserSettingsFormInput) => {
    updateMutation.mutate({
      currencyId: data.currencyId,
      timezoneId: data.timezoneId,
    });
  };

  const onCancel = () => {
    if (userSettings) {
      form.reset({
        currencyId: userSettings.currencyId,
        timezoneId: userSettings.timezoneId,
      });
    }
  };

  const isSubmitting = updateMutation.isPending;

  const hasError = userSettingsError || currenciesError || timezonesError;

  if (hasError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Failed to load preferences. Please refresh the page and try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize your currency and timezone preferences. These settings
            will affect how dates and amounts are displayed throughout the
            application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6">
                {/* Currency Selection */}
                <FormField
                  control={form.control}
                  name="currencyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Default Currency
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.id}>
                              <div className="flex items-center gap-2">
                                <span>{currency.name}</span>
                                <span className="text-xs">
                                  ({currency.code})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This currency will be used for displaying amounts
                        throughout the application.
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
                      <FormLabel className="flex items-center gap-2">
                        Timezone
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((timezone) => (
                            <SelectItem key={timezone.id} value={timezone.id}>
                              <div className="flex flex-col">
                                <span>{timezone.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This timezone will be used for displaying dates and
                        times throughout the application.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isDirty}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
