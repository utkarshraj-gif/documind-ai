"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { documentApi, chatApi } from "@/lib/api";
import { DocumentItem, ChatMessage, SourceItem } from "@/types";
import { AnswerBlock } from "@/components/AnswerBlock";
import {
  Sparkles,
  MessageSquare,
  FileText,
  Send,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function AssistantPage() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      loadDocs();
    }
  }, [authLoading, user]);

  const loadDocs = async () => {
    try {
      const res = await documentApi.list();
      const readyDocs = res.documents.filter((d) => d.status === "ready" || d.status === "processed");
      setDocuments(res.documents);
      if (res.documents.length > 0) {
        setSelectedDocId(res.documents[0].id);
        loadChatHistory(res.documents[0].id);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const loadChatHistory = async (docId: string) => {
    try {
      const res = await chatApi.getHistory(docId);
      setMessages(res.messages || []);
    } catch {
      setMessages([]);
    }
  };

  const handleDocChange = (docId: string) => {
    setSelectedDocId(docId);
    loadChatHistory(docId);
  };

  const handleAsk = async () => {
    const q = inputQuery.trim();
    if (!q || asking || !selectedDocId) return;

    setInputQuery("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setAsking(true);

    try {
      const reply = await chatApi.ask(selectedDocId, q);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply.content,
          sources: reply.sources,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message || "Failed to query document."}`,
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-accent" />
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-ink">
              AI Verification Assistant
            </h1>
          </div>
          <p className="text-sm text-ink-secondary">
            Strictly grounded inquiry. Responses link verbatim citations from selected documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-ink-muted">Active Document:</label>
          <select
            value={selectedDocId}
            onChange={(e) => handleDocChange(e.target.value)}
            disabled={loadingDocs || documents.length === 0}
            className="px-3 py-2 text-xs font-sans bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-ink max-w-xs truncate"
          >
            {documents.length === 0 ? (
              <option value="">No documents uploaded</option>
            ) : (
              documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.original_filename}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Selector Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-muted">
            Indexed Documents
          </div>
          {loadingDocs ? (
            <div className="p-4 text-center text-xs text-ink-muted">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-4 bg-surface border border-border rounded-lg text-center space-y-2">
              <p className="text-xs text-ink-muted">No documents found.</p>
              <a
                href="/documents"
                className="inline-block text-xs font-medium text-accent hover:underline"
              >
                Upload your first document →
              </a>
            </div>
          ) : (
            <div className="space-y-1.5">
              {documents.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleDocChange(doc.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-surface border-ink shadow-subtle text-ink font-medium"
                        : "bg-surface-subtle border-border text-ink-secondary hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <div className="flex items-start gap-2 truncate">
                      <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-accent" : "text-ink-muted"}`} />
                      <div className="truncate">
                        <div className="truncate font-medium">{doc.original_filename}</div>
                        <div className="text-[10px] text-ink-muted font-mono mt-0.5">
                          {doc.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 text-ink shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat / Assistant Interaction Area */}
        <div className="lg:col-span-3 flex flex-col h-[72vh] bg-surface border border-border rounded-xl overflow-hidden shadow-subtle">
          {/* Active Context Banner */}
          <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-ink">
                Querying context:{" "}
                <strong className="font-mono text-ink">
                  {selectedDoc ? selectedDoc.original_filename : "None selected"}
                </strong>
              </span>
            </div>
            {selectedDoc && (
              <a
                href={`/documents/${selectedDoc.id}`}
                className="text-xs text-accent hover:underline font-mono"
              >
                View full document sheet →
              </a>
            )}
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent-faint flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-ink">
                  Ask Any Question
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  The AI assistant will examine the document text and formulate a response backed
                  by direct page and text excerpts. If the information isn’t present, it will decline
                  to fabricate.
                </p>
                {selectedDoc && (
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {[
                      "What are the payment terms?",
                      "Summarize the key deliverables",
                      "Who are the named parties?",
                    ].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => setInputQuery(sample)}
                        className="px-3 py-1.5 text-xs bg-surface border border-border rounded-full text-ink-secondary hover:text-ink hover:border-ink transition-colors"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg, idx) => (
                <AnswerBlock key={idx} message={msg} />
              ))
            )}

            {asking && (
              <div className="flex items-center gap-2 p-3 bg-surface-subtle border border-border rounded-lg text-xs text-ink-muted">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span>Searching text chunks and extracting verifiable citations...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 border-t border-border bg-canvas">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  selectedDoc
                    ? `Ask about ${selectedDoc.original_filename}...`
                    : "Select a document to begin..."
                }
                disabled={!selectedDoc || asking}
                className="flex-1 px-4 py-2.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!selectedDoc || asking || !inputQuery.trim()}
                className="px-4 py-2.5 bg-ink text-white rounded-lg text-xs font-medium hover:bg-ink-secondary disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
