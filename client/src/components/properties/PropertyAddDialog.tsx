"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropertyAddForm } from "./PropertyAddForm";
import { Property } from "@/types/properties";

interface PropertyAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded: (property: Property) => void;
}

export function PropertyAddDialog({
  isOpen,
  onClose,
  onPropertyAdded,
}: PropertyAddDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (property: Property) => {
    setIsSubmitting(true);
    try {
      // The PropertyAddForm handles the API call, so we just need to
      // pass the created property back to the parent
      onPropertyAdded(property);
      onClose(); // Close the dialog on success
    } catch (error) {
      console.error("Error in PropertyAddDialog:", error);
      // Error handling is done in PropertyAddForm, but we should reset submitting state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col p-6 gap-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-foreground font-semibold">
                  Add New Property
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <PropertyAddForm
            onSave={handleSave}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}