import React, { useState } from "react";
import { Send, Sparkles, CornerDownLeft, Loader2 } from "lucide-react";

interface QuestionInputProps {
  onAsk: (question: string) => Promise<void>;
  isLoading: boolean;
  className?: string;
}

const SUGGESTED_QUESTIONS = [
  "What is the total amount?",
  "What is the document number?",
  "Who issued this document?",
  "What dates are mentioned?",
  "What is this document about?",
];

export function QuestionInput({ onAsk, isLoading, className }: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    const q = question.trim();
    setQuestion("");
    await onAsk(q);
  };

  const handleSuggestedClick = async (q: string) => {
    if (isLoading) return;
    await onAsk(q);
  };

  return (
    <div className={`space-y-3 ${className || ""}`}>
      {/* Suggested Questions */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-ink-muted">
          <Sparkles className="w-3 h-3 text-accent" />
          Suggested Questions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSuggestedClick(q)}
              disabled={isLoading}
              className="text-xs font-mono px-2.5 py-1 rounded bg-surface border border-border hover:border-accent/50 hover:bg-accent-faint hover:text-accent text-ink-secondary transition-all text-left disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about this document..."
            disabled={isLoading}
            className="w-full pl-3.5 pr-24 py-2.5 text-sm bg-surface border border-border rounded-md shadow-subtle placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink disabled:bg-surface-subtle transition-all"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="absolute right-1.5 px-3 py-1.5 bg-ink text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-subtle hover:bg-ink-secondary disabled:opacity-40 disabled:hover:bg-ink transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Ask</span>
                <Send className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-ink-muted px-1">
          <span>Grounded strictly in uploaded document</span>
          <span className="hidden sm:inline">Press Enter ↵ to ask</span>
        </div>
      </form>
    </div>
  );
}
