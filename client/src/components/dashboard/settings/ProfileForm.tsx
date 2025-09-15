"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      // Basic phone validation - allows various formats
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""));
    }, "Please enter a valid phone number"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update the session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          ...updatedUser,
        },
      });

      toast.success("Profile updated successfully");
      reset(data); // Reset form state to remove isDirty
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your phone number (optional)"
          {...register("phone")}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        {isDirty && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
