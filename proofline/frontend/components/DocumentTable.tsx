import React from "react";
import { DocumentItem } from "@/types";
import { DocumentStatus } from "@/components/DocumentStatus";
import { formatBytes, formatDate } from "@/lib/utils";
import { FileText, Trash2, ArrowUpRight, FolderOpen } from "lucide-react";

interface DocumentTableProps {
  documents: DocumentItem[];
  onDelete?: (id: string) => void;
  className?: string;
}

export function DocumentTable({ documents, onDelete, className }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className={`p-8 text-center bg-surface border border-border rounded-lg ${className || ""}`}>
        <FolderOpen className="w-8 h-8 text-ink-faint mx-auto mb-2" />
        <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-ink-secondary mb-1">
          No Documents Found
        </h4>
        <p className="text-xs text-ink-muted max-w-sm mx-auto">
          Upload a document above to extract structured facts and ask grounded questions.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-border bg-surface shadow-subtle ${className || ""}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-surface-subtle text-[11px] font-mono uppercase tracking-wider text-ink-secondary">
            <th className="py-3 px-4 font-semibold">Document</th>
            <th className="py-3 px-3 font-semibold">Format</th>
            <th className="py-3 px-3 font-semibold">Size</th>
            <th className="py-3 px-3 font-semibold">Status</th>
            <th className="py-3 px-3 font-semibold">Uploaded</th>
            <th className="py-3 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="hover:bg-canvas/80 transition-colors group"
            >
              <td className="py-3 px-4">
                <a
                  href={`/documents/${doc.id}`}
                  className="flex items-center gap-2.5 font-medium text-ink hover:text-accent group-hover:underline"
                >
                  <FileText className="w-4 h-4 text-accent shrink-0" />
                  <span className="truncate max-w-[220px] sm:max-w-xs">{doc.original_filename}</span>
                </a>
              </td>
              <td className="py-3 px-3 font-mono text-ink-secondary uppercase">
                {doc.file_type.split("/")[1] || "PDF"}
              </td>
              <td className="py-3 px-3 font-mono text-ink-secondary">
                {formatBytes(doc.file_size)}
              </td>
              <td className="py-3 px-3">
                <DocumentStatus status={doc.status} />
              </td>
              <td className="py-3 px-3 font-mono text-ink-muted">
                {formatDate(doc.created_at)}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <a
                    href={`/documents/${doc.id}`}
                    className="p-1 text-ink-secondary hover:text-ink hover:bg-surface-subtle rounded transition-colors"
                    title="Open workspace"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-1 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
