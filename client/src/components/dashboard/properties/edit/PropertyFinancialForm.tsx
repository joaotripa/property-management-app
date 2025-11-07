"use client";

import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { OccupancyStatus } from "@/types/properties";
import { UpdatePropertyInput } from "@/lib/validations/property";

interface PropertyFinancialFormProps {
  form: UseFormReturn<UpdatePropertyInput>;
  isSaving: boolean;
}

export function PropertyFinancialForm({
  form,
  isSaving,
}: PropertyFinancialFormProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Financial Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rent (€)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    disabled={isSaving}
                    placeholder="Enter monthly rent"
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price (€)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    disabled={isSaving}
                    placeholder="Enter purchase price"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tenants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Tenants</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    disabled={isSaving}
                    placeholder="Number of tenants"
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="occupancy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupancy Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSaving}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupancy status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={OccupancyStatus.AVAILABLE}>
                      Available
                    </SelectItem>
                    <SelectItem value={OccupancyStatus.OCCUPIED}>
                      Occupied
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
