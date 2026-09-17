import React, { useState } from "react";
import { DocumentDetail } from "@/types";
import { DocumentStatus } from "@/components/DocumentStatus";
import { formatBytes, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Trash2,
  Download,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { documentApi } from "@/lib/api";

interface WorkspaceHeaderProps {
  document: DocumentDetail;
  onDelete?: () => void;
  className?: string;
}

export function WorkspaceHeader({ document, onDelete, className }: WorkspaceHeaderProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const fileUrl = documentApi.getFileUrl(document.id);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${document.original_filename}"? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await documentApi.delete(document.id);
      if (onDelete) onDelete();
    } catch (err: any) {
      alert(err.message || "Failed to delete document.");
      setIsDeleting(false);
    }
  };

  return (
    <div className={`bg-surface border-b border-border py-3 px-4 sm:px-6 shadow-subtle ${className || ""}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="p-1.5 rounded text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors"
            title="Return to Workspace"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-editorial font-bold text-ink tracking-tight">
                {document.original_filename}
              </h1>
              <DocumentStatus status={document.status} />
            </div>

            <div className="flex items-center gap-3 mt-0.5 text-xs font-mono text-ink-muted flex-wrap">
              <span>{formatBytes(document.file_size)}</span>
              <span>•</span>
              <span>{document.file_type.split("/")[1]?.toUpperCase() || "DOCUMENT"}</span>
              <span>•</span>
              <span>Uploaded {formatDate(document.created_at)}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Indexed for Verification
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-surface border border-border rounded shadow-subtle hover:bg-surface-subtle transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Raw File</span>
          </a>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded transition-colors disabled:opacity-50"
            title="Delete document"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
