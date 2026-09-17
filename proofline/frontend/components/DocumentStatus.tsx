import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface DocumentStatusProps {
  status: "processing" | "ready" | "failed" | string;
  className?: string;
  showIcon?: boolean;
}

export function DocumentStatus({ status, className, showIcon = true }: DocumentStatusProps) {
  const normalized = status.toLowerCase();

  if (normalized === "ready") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60",
          className
        )}
      >
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        Ready
      </span>
    );
  }

  if (normalized === "processing") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60",
          className
        )}
      >
        {showIcon && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        )}
        Processing
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200/60",
        className
      )}
    >
      {showIcon && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
      Failed
    </span>
  );
}
