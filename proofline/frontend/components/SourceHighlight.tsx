import React from "react";
import { SourceItem } from "@/types";
import { cn } from "@/lib/utils";
import { Sparkles, X } from "lucide-react";

interface SourceHighlightProps {
  source: SourceItem | null;
  onClear: () => void;
  className?: string;
}

export function SourceHighlight({ source, onClear, className }: SourceHighlightProps) {
  if (!source) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-xs",
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
          Target: Page {source.page}
        </span>
        <span className="truncate font-mono italic text-amber-950">
          &ldquo;{source.text}&rdquo;
        </span>
      </div>
      <button
        onClick={onClear}
        className="p-1 text-amber-700 hover:text-amber-950 hover:bg-amber-100 rounded"
        title="Clear citation highlight"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
