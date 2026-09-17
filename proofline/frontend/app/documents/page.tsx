"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DocumentTable } from "@/components/DocumentTable";
import { UploadPanel } from "@/components/UploadPanel";
import { documentApi } from "@/lib/api";
import { DocumentItem } from "@/types";
import { FolderOpen, Search, Filter, Plus, X, SortDesc, SortAsc } from "lucide-react";

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showUpload, setShowUpload] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await documentApi.list({
        search: search || undefined,
        sort: sortOrder,
        status_filter: statusFilter || undefined,
      });
      setDocuments(data.documents);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDocuments();
    }
  }, [authLoading, user, sortOrder, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authLoading && user) fetchDocuments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentApi.delete(id);
      fetchDocuments();
    } catch (err: any) {
      alert(err.message || "Failed to delete document.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen className="w-5 h-5 text-accent" />
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-ink">
              Documents
            </h1>
          </div>
          <p className="text-sm text-ink-secondary">
            {total} document{total !== 1 ? "s" : ""} in your workspace
          </p>
        </div>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ink text-white text-xs font-medium rounded shadow-subtle hover:bg-ink-secondary transition-all"
        >
          {showUpload ? (
            <>
              <X className="w-4 h-4" />
              <span>Close upload</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>+ Upload document</span>
            </>
          )}
        </button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="p-6 bg-surface border border-border rounded-xl shadow-subtle">
          <UploadPanel
            onSuccess={() => {
              setShowUpload(false);
              fetchDocuments();
            }}
          />
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by filename..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-mono bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-ink"
          >
            <option value="">All statuses</option>
            <option value="ready">Ready</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
            className="p-2 border border-border rounded bg-surface hover:bg-surface-subtle text-ink-secondary transition-colors"
            title={`Sort ${sortOrder === "desc" ? "oldest first" : "newest first"}`}
          >
            {sortOrder === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Document Table */}
      {loading ? (
        <div className="p-12 text-center bg-surface border border-border rounded-lg text-xs font-mono text-ink-muted">
          Loading documents...
        </div>
      ) : (
        <DocumentTable documents={documents} onDelete={handleDelete} />
      )}
    </div>
  );
}
