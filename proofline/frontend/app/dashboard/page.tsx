"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UploadPanel } from "@/components/UploadPanel";
import { DocumentTable } from "@/components/DocumentTable";
import { dashboardApi, documentApi } from "@/lib/api";
import { DashboardStats, DocumentItem } from "@/types";
import {
  Plus,
  Compass,
  FileCheck,
  Clock,
  HelpCircle,
  FolderOpen,
  ArrowUpRight,
  X,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchStats();
    }
  }, [authLoading, user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentApi.delete(id);
      fetchStats();
    } catch (err: any) {
      alert(err.message || "Failed to delete document.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 w-full">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-accent" />
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-ink">
              Your workspace
            </h1>
          </div>
          <p className="text-sm text-ink-secondary">
            Review, analyze and question your documents.
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

      {/* Upload Drawer / Section */}
      {showUpload && (
        <div className="p-6 bg-surface border border-border rounded-xl shadow-subtle animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-ink">
                Upload New Document
              </h2>
              <p className="text-xs text-ink-secondary">
                Upload a PDF or image for page-by-page extraction and grounded verification.
              </p>
            </div>
          </div>
          <UploadPanel
            onSuccess={() => {
              setShowUpload(false);
              fetchStats();
            }}
          />
        </div>
      )}

      {/* Focused Document Stat Badges (No meaningless decorative charts) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-surface shadow-subtle">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1">
            Total Documents
          </div>
          <div className="font-mono text-2xl font-bold text-ink">
            {stats?.total_documents ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-subtle">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Ready for Q&A</span>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-700">
            {stats?.ready_documents ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-subtle">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing</span>
          </div>
          <div className="font-mono text-2xl font-bold text-amber-700">
            {stats?.processing_documents ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-subtle">
          <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Inquiries Asked</span>
          </div>
          <div className="font-mono text-2xl font-bold text-ink">
            {stats?.total_questions ?? 0}
          </div>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-secondary flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-accent" />
            <span>Recent Documents</span>
          </h2>
          <a
            href="/documents"
            className="text-xs font-medium text-ink-secondary hover:text-ink flex items-center gap-1 hover:underline"
          >
            <span>View all documents</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-surface border border-border rounded-lg text-xs font-mono text-ink-muted">
            Loading recent workspace documents...
          </div>
        ) : (
          <DocumentTable
            documents={stats?.recent_documents || []}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
