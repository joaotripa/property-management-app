"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

const deleteAccountSchema = z.object({
  email: z.email("Please enter a valid email address"),
  confirmDeletion: z.boolean().refine((val) => val === true, {
    message: "You must confirm that you want to delete your account",
  }),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({
  isOpen,
  onClose,
}: DeleteAccountDialogProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      email: "",
      confirmDeletion: false,
    },
  });

  const confirmDeletion = watch("confirmDeletion");
  const userEmail = session?.user?.email || "";

  const onSubmit = async (data: DeleteAccountFormData) => {
    // Double-check email matches
    if (data.email !== userEmail) {
      toast.error("Email does not match your account email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }

      toast.success("Account deleted successfully. You will be signed out.");

      // Sign out user after successful deletion
      setTimeout(async () => {
        await signOut({ callbackUrl: "/" });
      }, 2000);

      handleClose();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive mb-2">
                Warning: This will permanently delete your account
              </h4>
              <ul className="text-sm space-y-1 text-destructive/80">
                <li>• All your properties and transactions will be deleted</li>
                <li>• Your subscription will be cancelled immediately</li>
                <li>• All data will be permanently removed from our servers</li>
                <li>• This action cannot be reversed</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Type your email address{" "}
              <span className="font-mono">({userEmail})</span> to confirm:
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
              autoComplete="off"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirmDeletion"
              checked={confirmDeletion}
              onCheckedChange={(checked) =>
                setValue("confirmDeletion", checked === true)
              }
            />
            <Label
              htmlFor="confirmDeletion"
              className="text-sm leading-relaxed"
            >
              I understand that deleting my account is permanent and cannot be
              undone
            </Label>
          </div>
          {errors.confirmDeletion && (
            <p className="text-sm text-destructive">
              {errors.confirmDeletion.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
