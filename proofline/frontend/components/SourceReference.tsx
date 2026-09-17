import React from "react";
import { SourceItem } from "@/types";
import { ExternalLink, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceReferenceProps {
  source: SourceItem;
  onSelect?: (source: SourceItem) => void;
  className?: string;
}

export function SourceReference({ source, onSelect, className }: SourceReferenceProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col p-3 rounded border border-border bg-canvas/70 hover:bg-surface hover:border-accent/40 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <BookmarkCheck className="w-3.5 h-3.5 text-accent" />
          <span className="text-[11px] font-mono font-semibold text-accent uppercase tracking-wider">
            Page {source.page}
          </span>
        </div>
        {onSelect && (
          <button
            onClick={() => onSelect(source)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-secondary group-hover:text-accent hover:underline transition-colors"
          >
            <span>View source</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
      <p className="text-xs text-ink-secondary font-mono leading-relaxed line-clamp-3 bg-surface p-2 rounded border border-border-subtle group-hover:border-accent-subtle">
        &ldquo;{source.text}&rdquo;
      </p>
    </div>
  );
}
