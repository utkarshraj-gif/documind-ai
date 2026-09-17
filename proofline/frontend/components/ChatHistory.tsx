import React, { useRef, useEffect } from "react";
import { ChatMessage, SourceItem } from "@/types";
import { AnswerBlock } from "@/components/AnswerBlock";
import { HelpCircle } from "lucide-react";

interface ChatHistoryProps {
  messages: ChatMessage[];
  onSelectSource?: (source: SourceItem) => void;
  className?: string;
}

export function ChatHistory({ messages, onSelectSource, className }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={`p-8 text-center border border-dashed border-border rounded-lg bg-surface/50 ${className || ""}`}>
        <HelpCircle className="w-8 h-8 text-ink-faint mx-auto mb-2" />
        <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-ink-secondary mb-1">
          No Questions Asked Yet
        </h4>
        <p className="text-xs text-ink-muted max-w-sm mx-auto">
          Choose a suggested question above or type any query to receive a grounded answer with verifiable source citations.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-1 overflow-y-auto ${className || ""}`}>
      {messages.map((msg) => (
        <AnswerBlock
          key={msg.id}
          message={msg}
          onSelectSource={onSelectSource}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
