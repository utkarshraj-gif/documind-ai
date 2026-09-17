"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { documentApi } from "@/lib/api";
import { ProcessingTimeline, ProcessingStage } from "@/components/ProcessingTimeline";
import { DocumentDetail } from "@/types";

interface UploadPanelProps {
  onSuccess?: (doc: DocumentDetail) => void;
  className?: string;
}

export function UploadPanel({ onSuccess, className }: UploadPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState<ProcessingStage>("uploading");
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    // Client-side validation
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg)$/i)) {
      setError("Please upload a supported document (PDF, PNG, JPG, JPEG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Document exceeds the maximum 10 MB limit.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // 1. Uploading
      setCurrentStage("uploading");
      await new Promise((r) => setTimeout(r, 400));

      // 2. Reading
      setCurrentStage("reading");
      await new Promise((r) => setTimeout(r, 400));

      // 3. Extracting
      setCurrentStage("extracting");

      // Actual API call
      const uploadedDoc = await documentApi.upload(file);

      // 4. Analyzing
      setCurrentStage("analyzing");
      await new Promise((r) => setTimeout(r, 500));

      // 5. Ready
      setCurrentStage("ready");
      await new Promise((r) => setTimeout(r, 400));

      if (onSuccess) {
        onSuccess(uploadedDoc);
      } else {
        router.push(`/documents/${uploadedDoc.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Document processing failed. Try again.");
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // 1-Click Sample Document Ingestion
  const handleTrySample = async () => {
    try {
      setIsUploading(true);
      setCurrentStage("uploading");
      setError(null);

      // Fetch sample invoice from public folder or API
      const res = await fetch("/sample_data/sample_invoice.pdf");
      let blob: Blob;
      if (res.ok) {
        blob = await res.blob();
      } else {
        // Fallback fetch from root or backend
        const res2 = await fetch("http://127.0.0.1:8000/api/documents");
        // Create an illustrative sample invoice PDF blob
        blob = new Blob(["Sample Invoice Data"], { type: "application/pdf" });
      }

      const sampleFile = new File([blob], "sample_invoice.pdf", { type: "application/pdf" });
      await processFile(sampleFile);
    } catch (err: any) {
      setError("Unable to load sample document. You can drag and drop any PDF instead.");
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all ${
          isDragging
            ? "border-accent bg-accent-faint"
            : "border-border hover:border-border-dark bg-surface"
        } ${isUploading ? "pointer-events-none opacity-90" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="py-2 space-y-4">
            <h3 className="font-editorial text-lg font-bold text-ink">
              Processing Document for Grounded Analysis
            </h3>
            <ProcessingTimeline currentStage={currentStage} />
            <p className="text-xs font-mono text-ink-muted animate-pulse">
              Extracting text page coordinates, entities, and establishing verification index...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-canvas border border-border flex items-center justify-center mx-auto text-ink-secondary shadow-subtle">
              <UploadCloud className="w-6 h-6 text-accent" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-ink">
                Drag and drop your document here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-accent underline font-semibold hover:text-accent-hover"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs font-mono text-ink-muted">
                Supports PDF, PNG, JPG, JPEG up to 10 MB
              </p>
            </div>

            {/* Quick 1-Click Sample Test Button */}
            <div className="pt-2 border-t border-border-subtle flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleTrySample}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-ink bg-surface-subtle hover:bg-surface border border-border rounded shadow-subtle hover:border-accent/40 transition-all group"
              >
                <FileText className="w-3.5 h-3.5 text-accent" />
                <span>Try sample document (sample_invoice.pdf)</span>
                <ArrowRight className="w-3 h-3 text-ink-muted group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
