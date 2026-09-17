import React, { useState } from "react";
import { DocumentAnalysis } from "@/types";
import { RefreshCw, FileText, CheckCircle } from "lucide-react";
import { analysisApi } from "@/lib/api";

interface SummaryPanelProps {
  documentId: string;
  analysis?: DocumentAnalysis | null;
  onAnalysisUpdated?: (updated: DocumentAnalysis) => void;
  className?: string;
}

export function SummaryPanel({
  documentId,
  analysis,
  onAnalysisUpdated,
  className,
}: SummaryPanelProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    try {
      const updated = await analysisApi.regenerateSummary(documentId);
      if (onAnalysisUpdated) {
        onAnalysisUpdated(updated);
      }
    } catch (err: any) {
      setError(err.message || "Unable to regenerate summary.");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!analysis) {
    return (
      <div className="p-4 rounded border border-border bg-surface text-center text-xs text-ink-muted">
        No executive summary available for this document.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-secondary">
            Executive Summary
          </h3>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono text-ink-secondary hover:text-ink bg-surface border border-border rounded shadow-subtle hover:bg-surface-subtle disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin text-accent" : ""}`} />
          <span>{isRegenerating ? "Regenerating..." : "Regenerate summary"}</span>
        </button>
      </div>

      {error && (
        <div className="p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* Summary Narrative */}
      <div className="p-3.5 rounded border border-border bg-surface shadow-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">
            {analysis.document_type || "Document"}
          </span>
          <span className="text-[10px] font-mono text-ink-muted">
            Grounding Verified
          </span>
        </div>
        <p className="text-sm font-serif leading-relaxed text-ink">
          {analysis.summary}
        </p>
      </div>

      {/* Key Takeaways */}
      {analysis.key_points && analysis.key_points.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-mono uppercase tracking-wider font-semibold text-ink-muted">
            Key Verified Findings
          </h4>
          <div className="space-y-1.5">
            {analysis.key_points.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded bg-surface border border-border-subtle text-xs text-ink-secondary"
              >
                <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span className="leading-snug">{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
