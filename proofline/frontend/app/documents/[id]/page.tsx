"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { documentApi, analysisApi, chatApi } from "@/lib/api";
import { DocumentDetail, ChatMessage, DocumentAnalysis } from "@/types";
import { WorkspaceHeader } from "@/components/WorkspaceHeader";
import { DocumentViewer } from "@/components/DocumentViewer";
import { SummaryPanel } from "@/components/SummaryPanel";
import { ProcessingTimeline } from "@/components/ProcessingTimeline";
import { AnswerBlock } from "@/components/AnswerBlock";
import {
  FileText,
  MessageSquare,
  BarChart3,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Send,
  Sparkles,
  BookOpen,
  RefreshCw,
} from "lucide-react";

type Tab = "overview" | "chat" | "analysis";

export default function DocumentWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const docId = params.id as string;

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(null);

  // Fetch document
  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentApi.get(docId);
      setDoc(data);

      // Use the analysis from the document detail
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load document.");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    try {
      const data = await chatApi.getHistory(docId);
      setChatMessages(data.messages || []);
    } catch {
      // Chat history might not exist yet
    }
  }, [docId]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDocument();
      fetchChatHistory();
    }
  }, [authLoading, user, fetchDocument, fetchChatHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle chat send
  const handleSendMessage = async () => {
    const question = chatInput.trim();
    if (!question || chatLoading) return;

    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: question },
    ]);
    setChatLoading(true);

    try {
      const response = await chatApi.ask(docId, question);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.content,
          sources: response.sources,
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message || "Failed to get a response."}`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle analysis
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analysisApi.analyze(docId);
      setAnalysisResult(result);
      fetchDocument(); // Refresh
    } catch (err: any) {
      alert(err.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
          <span className="text-xs font-mono text-ink-muted">Loading document...</span>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-sm text-ink-secondary">{error || "Document not found."}</p>
          <button
            onClick={() => router.push("/documents")}
            className="text-xs text-accent hover:underline"
          >
            ← Back to documents
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <FileText className="w-4 h-4" /> },
    { key: "chat", label: "Ask AI", icon: <MessageSquare className="w-4 h-4" /> },
    { key: "analysis", label: "Analysis", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
      {/* Back + Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push("/documents")}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to documents
        </button>

        <WorkspaceHeader document={doc} />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === tab.key
                ? "border-ink text-ink"
                : "border-transparent text-ink-muted hover:text-ink-secondary hover:border-border"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[60vh]">
        {/* ===== Overview Tab ===== */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Preview */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-ink-muted" />
                <span className="text-xs font-medium text-ink">Document Preview</span>
              </div>
              <DocumentViewer document={doc} />
            </div>

            {/* Right Column: Summary + Quick Actions */}
            <div className="space-y-4">
              <SummaryPanel
                documentId={doc.id}
                analysis={analysisResult}
                onAnalysisUpdated={(updated) => setAnalysisResult(updated)}
              />

              {/* Quick Actions */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-medium text-ink flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Quick actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs bg-surface-subtle border border-border rounded-lg hover:bg-surface transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-accent" />
                    Ask a question
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs bg-surface-subtle border border-border rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
                  >
                    {analyzing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <BarChart3 className="w-3.5 h-3.5 text-accent" />
                    )}
                    {analyzing ? "Analyzing..." : "Run analysis"}
                  </button>
                </div>
              </div>

              {/* Processing Timeline */}
              <ProcessingTimeline document={doc} />
            </div>
          </div>
        )}

        {/* ===== Chat Tab — core AI feature ===== */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-[65vh] bg-surface border border-border rounded-xl overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-ink">
                  Ask questions about{" "}
                  <span className="font-mono text-ink-secondary">{doc.original_filename}</span>
                </span>
              </div>
              <span className="text-[10px] text-ink-muted font-mono">
                {chatMessages.length} messages
              </span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-ink-muted" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-ink-secondary">
                      Start a conversation
                    </p>
                    <p className="text-xs text-ink-muted max-w-sm">
                      Ask any question about this document. Every answer is grounded in the
                      actual content and includes verifiable citations.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {[
                      "What is this document about?",
                      "Summarize the key points",
                      "What are the important dates?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setChatInput(suggestion)}
                        className="px-3 py-1.5 text-[11px] bg-surface-subtle border border-border rounded-full text-ink-muted hover:text-ink hover:border-ink transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-ink text-white"
                        : "bg-surface-subtle border border-border text-ink"
                    }`}
                  >
                    <AnswerBlock message={msg} />
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 bg-surface-subtle border border-border rounded-xl px-4 py-3">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                    <span className="text-xs text-ink-muted">Analyzing document...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask a question about this document..."
                  disabled={chatLoading}
                  className="flex-1 px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2.5 bg-ink text-white rounded-lg hover:bg-ink-secondary transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Analysis Tab ===== */}
        {activeTab === "analysis" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-ink">Document Analysis</h2>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs bg-ink text-white rounded shadow-subtle hover:bg-ink-secondary disabled:opacity-50 transition-all"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    {analysisResult ? "Re-analyze" : "Run Analysis"}
                  </>
                )}
              </button>
            </div>

            {analysisResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Summary */}
                <div className="bg-surface border border-border rounded-xl p-5 col-span-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">
                      {analysisResult.document_type}
                    </span>
                  </div>
                  <h3 className="text-xs font-medium text-ink-muted mb-2">Summary</h3>
                  <p className="text-sm text-ink leading-relaxed font-serif">
                    {analysisResult.summary}
                  </p>
                </div>

                {/* Key Points */}
                {analysisResult.key_points && analysisResult.key_points.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="text-xs font-medium text-ink-muted mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {analysisResult.key_points.map((point, i) => (
                        <li key={i} className="flex gap-2 text-sm text-ink-secondary">
                          <span className="text-accent font-mono text-xs mt-0.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted Entities */}
                {analysisResult.extracted_entities && (
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <h3 className="text-xs font-medium text-ink-muted mb-3">
                      Extracted Entities
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(analysisResult.extracted_entities)
                        .filter(([key]) => key !== "document_type")
                        .map(([key, values]) =>
                          Array.isArray(values) && values.length > 0 ? (
                            <div key={key}>
                              <dt className="text-[10px] font-mono text-ink-muted uppercase mb-1">
                                {key.replace(/_/g, " ")}
                              </dt>
                              <div className="flex flex-wrap gap-1.5">
                                {values.map((v: string, i: number) => (
                                  <span
                                    key={i}
                                    className="inline-block px-2 py-0.5 text-xs bg-surface-subtle border border-border rounded-full text-ink-secondary"
                                  >
                                    {v}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null
                        )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-surface border border-border rounded-xl">
                <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-ink-muted" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-ink-secondary">No analysis yet</p>
                  <p className="text-xs text-ink-muted max-w-sm">
                    Run an AI-powered analysis to extract summaries, key points, entities,
                    and metadata from this document.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
