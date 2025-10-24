"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Info, Shield, Trash2 } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AccountInfo } from "@/hooks/queries/usePreferencesQueries";

interface AccountSettingsProps {
  accountInfo: AccountInfo;
}

export function AccountSettings({ accountInfo }: AccountSettingsProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your account details and personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 py-2">
            <div className="flex items-center gap-2">
              <Label>Email Address</Label>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-muted rounded-md border border-border w-fit">
                <span className="text-sm font-medium">{accountInfo.email}</span>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={20} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>Email address cannot be changed</span>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <ProfileForm />
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Security
          </CardTitle>
          <CardDescription>
            Manage your password and account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">
                Change your password to keep your account secure
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Info size={20} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>Password cannot be changed for Google accounts</span>
                </TooltipContent>
              </Tooltip>
              <Button
                variant="outline"
                disabled={accountInfo.hasGoogleAccount}
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      />

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
