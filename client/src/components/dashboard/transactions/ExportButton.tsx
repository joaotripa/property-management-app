"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ExportButton({ searchParams }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const params = new URLSearchParams();

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, String(value));
        }
      });

      const response = await fetch(`/api/transactions/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to export transactions");
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
      const fileName = fileNameMatch ? fileNameMatch[1] : `tax-report_${new Date().toISOString().replace(/[-:]/g, '').replace('T', '').split('.')[0]}.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Your tax report has been exported to CSV.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export tax report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export
    </Button>
  );
}