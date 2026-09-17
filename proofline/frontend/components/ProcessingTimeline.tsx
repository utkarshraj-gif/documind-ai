import React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentDetail, DocumentItem } from "@/types";

export type ProcessingStage = "uploading" | "reading" | "extracting" | "analyzing" | "ready";

interface ProcessingTimelineProps {
  currentStage?: ProcessingStage;
  document?: DocumentDetail | DocumentItem;
  className?: string;
}

const STAGES: { key: ProcessingStage; label: string; desc: string }[] = [
  { key: "uploading", label: "Uploading", desc: "Transmitting file" },
  { key: "reading", label: "Reading", desc: "Parsing binary format" },
  { key: "extracting", label: "Extracting", desc: "Page text & layout segmentation" },
  { key: "analyzing", label: "Analyzing", desc: "AI grounding & entity extraction" },
  { key: "ready", label: "Ready", desc: "Verification workspace prepared" },
];

function resolveStage(currentStage?: ProcessingStage, doc?: DocumentDetail | DocumentItem): ProcessingStage {
  if (currentStage) return currentStage;
  if (!doc) return "ready";
  switch (doc.status?.toLowerCase()) {
    case "uploading":
      return "uploading";
    case "pending":
    case "reading":
      return "reading";
    case "processing":
    case "extracting":
      return "extracting";
    case "analyzing":
      return "analyzing";
    case "ready":
    case "processed":
    case "completed":
      return "ready";
    default:
      return "ready";
  }
}

export function ProcessingTimeline({ currentStage, document, className }: ProcessingTimelineProps) {
  const activeStage = resolveStage(currentStage, document);
  const currentIndex = STAGES.findIndex((s) => s.key === activeStage);

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-border -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-accent transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100 - 8)}%`,
          }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx < currentIndex || activeStage === "ready";
          const isActive = idx === currentIndex && activeStage !== "ready";
          const isPending = idx > currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                  isDone && "bg-ink text-white shadow-subtle",
                  isActive && "bg-accent text-white ring-4 ring-accent-subtle shadow-subtle",
                  isPending && "bg-surface border border-border text-ink-muted"
                )}
              >
                {isDone ? (
                  <Check className="w-4 h-4 text-white" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium tracking-tight",
                  isActive && "text-accent font-semibold",
                  isDone && "text-ink font-medium",
                  isPending && "text-ink-muted"
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
