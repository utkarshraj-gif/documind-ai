import React, { useState, useEffect, useRef } from "react";
import { DocumentDetail, DocumentPageText, SourceItem } from "@/types";
import { SourceHighlight } from "@/components/SourceHighlight";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import { documentApi } from "@/lib/api";

interface DocumentViewerProps {
  document: DocumentDetail;
  activeSource?: SourceItem | null;
  onClearActiveSource?: () => void;
  className?: string;
}

export function DocumentViewer({
  document,
  activeSource,
  onClearActiveSource,
  className,
}: DocumentViewerProps) {
  const pages: DocumentPageText[] = document.extracted_text_pages || [];
  const totalPages = pages.length > 0 ? pages.length : 1;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Automatically switch page and scroll to view when active source changes
  useEffect(() => {
    if (activeSource && activeSource.page) {
      setCurrentPage(activeSource.page);
      if (pageContainerRef.current) {
        pageContainerRef.current.scrollTop = 0;
      }
    }
  }, [activeSource]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 180));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 70));
  const handleResetZoom = () => setZoomLevel(100);

  const activePageData = pages.find((p) => p.page === currentPage) || pages[0];

  // Text highlighting logic for active source or search query
  const renderHighlightedContent = (text: string) => {
    if (!text) return <p className="italic text-ink-muted">Empty page</p>;

    const targetSnippet = activeSource && activeSource.page === currentPage ? activeSource.text.trim() : null;
    const searchTarget = searchQuery.trim();

    // Split text into lines
    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
      const isTargetLine = targetSnippet && (
        line.toLowerCase().includes(targetSnippet.toLowerCase()) ||
        targetSnippet.toLowerCase().includes(line.toLowerCase())
      );

      const isSearchMatched = searchTarget && line.toLowerCase().includes(searchTarget.toLowerCase());

      return (
        <div
          key={lineIdx}
          className={`py-0.5 px-1.5 rounded transition-all ${
            isTargetLine
              ? "bg-amber-100/90 border-l-4 border-amber-600 font-semibold text-amber-950 shadow-sm highlight-pulse my-1"
              : isSearchMatched
              ? "bg-yellow-100 text-yellow-950 font-medium"
              : "hover:bg-surface-subtle"
          }`}
        >
          <span className="select-none inline-block w-6 text-[10px] font-mono text-ink-faint mr-2 text-right">
            {lineIdx + 1}
          </span>
          <span className="font-mono text-xs leading-relaxed text-ink">
            {line}
          </span>
        </div>
      );
    });
  };

  const fileUrl = documentApi.getFileUrl(document.id);

  return (
    <div className={`flex flex-col h-full bg-canvas rounded-lg border border-border overflow-hidden shadow-subtle ${className || ""}`}>
      {/* Viewer Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-2.5 bg-surface border-b border-border gap-2 text-xs">
        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded border border-border hover:bg-surface-subtle disabled:opacity-40 transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-ink-secondary px-1.5">
            Page <strong className="text-ink">{currentPage}</strong> of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded border border-border hover:bg-surface-subtle disabled:opacity-40 transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Search Controls */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 bg-surface-subtle p-0.5 rounded border border-border-subtle">
            <button
              onClick={handleZoomOut}
              className="p-1 text-ink-secondary hover:text-ink rounded hover:bg-surface"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 font-mono text-[11px] text-ink-secondary hover:text-ink rounded hover:bg-surface"
              title="Reset zoom"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-ink-secondary hover:text-ink rounded hover:bg-surface"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 rounded border border-border transition-colors ${
              isSearchOpen ? "bg-accent-faint border-accent text-accent" : "hover:bg-surface-subtle text-ink-secondary"
            }`}
            title="Search text in document"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded border border-border hover:bg-surface-subtle text-ink-secondary hover:text-ink transition-colors"
            title="View original file"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Inline Search Bar */}
      {isSearchOpen && (
        <div className="p-2 bg-surface-subtle border-b border-border flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-ink-muted ml-1" />
          <input
            type="text"
            placeholder="Search document text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs px-2 py-1 bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-ink"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[10px] font-mono text-ink-muted hover:text-ink px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Active Source Highlight Banner */}
      {activeSource && onClearActiveSource && (
        <div className="p-2 bg-amber-50/90 border-b border-amber-200">
          <SourceHighlight
            source={activeSource}
            onClear={onClearActiveSource}
          />
        </div>
      )}

      {/* Document Sheet Canvas */}
      <div
        ref={pageContainerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 bg-stone-100 flex justify-center"
      >
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className="w-full max-w-2xl bg-surface border border-border rounded shadow-card min-h-[700px] p-6 sm:p-10 transition-transform duration-150 flex flex-col justify-between"
        >
          {/* Sheet Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-6 text-[10px] font-mono text-ink-muted">
              <span className="uppercase tracking-wider font-semibold text-ink-secondary flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-accent" />
                {document.original_filename}
              </span>
              <span>VERIFIED DOCUMENT SHEET • PAGE {currentPage}</span>
            </div>

            {/* Content Body */}
            <div className="space-y-0.5 text-left">
              {activePageData ? (
                renderHighlightedContent(activePageData.text)
              ) : (
                <p className="text-xs font-mono text-ink-muted italic text-center py-10">
                  No text content available on this page.
                </p>
              )}
            </div>
          </div>

          {/* Sheet Footer */}
          <div className="pt-8 mt-10 border-t border-border-subtle flex items-center justify-between text-[9px] font-mono text-ink-faint">
            <span>Proofline Ingestion Hash: {document.id.slice(0, 8)}...</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
