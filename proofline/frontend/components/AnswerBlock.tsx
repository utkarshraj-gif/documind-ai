import React from "react";
import { ChatMessage, SourceItem } from "@/types";
import { SourceReference } from "@/components/SourceReference";
import { ShieldCheck, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerBlockProps {
  message: ChatMessage;
  onSelectSource?: (source: SourceItem) => void;
  className?: string;
}

export function AnswerBlock({ message, onSelectSource, className }: AnswerBlockProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className={cn("flex items-start gap-2.5 justify-end my-2", className)}>
        <div className="max-w-[85%] bg-surface border border-border p-3 rounded-lg shadow-subtle text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1 text-[10px] font-mono text-ink-muted uppercase">
            <span>You</span>
            <User className="w-3 h-3 text-ink-muted" />
          </div>
          <p className="text-sm font-sans text-ink">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant Response
  return (
    <div className={cn("flex flex-col gap-2 my-3", className)}>
      <div className="p-4 rounded-lg border border-border bg-surface shadow-subtle space-y-3">
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
              ANSWER
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
            Document Grounded
          </span>
        </div>

        {/* Answer Content */}
        <div className="text-sm font-serif text-ink leading-relaxed">
          {message.content}
        </div>

        {/* Sources Section */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-border-subtle space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted font-semibold">
              Source Citations ({message.sources.length})
            </div>
            <div className="grid grid-cols-1 gap-2">
              {message.sources.map((src, idx) => (
                <SourceReference
                  key={idx}
                  source={src}
                  onSelect={onSelectSource}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
