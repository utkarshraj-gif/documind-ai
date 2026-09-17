import React from "react";
import {
  FileText,
  ShieldCheck,
  Search,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono text-ink-secondary mb-8 shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Deterministic Document Intelligence</span>
          <span className="text-ink-faint">•</span>
          <span className="text-accent font-semibold">Zero Hallucination</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-editorial font-bold text-ink tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Turn documents into answers you can verify.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-ink-secondary max-w-2xl mx-auto font-sans leading-relaxed">
          Upload a document, extract what matters, and ask questions grounded in the original source. Every insight links directly to verifiable page evidence.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/signup"
            className="w-full sm:w-auto px-6 py-3 bg-ink text-white font-medium text-sm rounded shadow-subtle hover:bg-ink-secondary transition-all flex items-center justify-center gap-2 group"
          >
            <span>Open workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#preview"
            className="w-full sm:w-auto px-6 py-3 bg-surface border border-border text-ink font-medium text-sm rounded shadow-subtle hover:bg-surface-subtle transition-all"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* Realistic Product Verification Preview */}
      <section id="preview" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-20 w-full">
        <div className="border border-border rounded-xl bg-surface shadow-card overflow-hidden">
          {/* Mock Window Header */}
          <div className="bg-surface-subtle border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-border-dark inline-block" />
              <span className="w-3 h-3 rounded-full bg-border-dark inline-block" />
              <span className="w-3 h-3 rounded-full bg-border-dark inline-block" />
              <span className="text-xs font-mono text-ink-muted ml-3 hidden sm:inline">
                INV-2026-1042.pdf • Proofline Verification Workspace
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/50 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grounded Evidence</span>
            </div>
          </div>

          {/* 3-Column Simulation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* 1. Document Preview */}
            <div className="lg:col-span-4 p-5 bg-canvas/60">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-semibold mb-3 flex items-center justify-between">
                <span>1. Original Document</span>
                <span className="text-accent font-mono">Page 1 of 2</span>
              </div>
              <div className="p-4 bg-surface rounded border border-border shadow-subtle text-left space-y-2 font-mono text-xs">
                <div className="border-b border-border-subtle pb-2 mb-2 font-bold text-ink">
                  TAX INVOICE & SERVICE CONTRACT
                </div>
                <div className="text-ink-secondary">
                  <strong>ISSUER:</strong> Example Pvt Ltd
                </div>
                <div className="text-ink-secondary">
                  <strong>INVOICE NO:</strong> INV-2026-1042
                </div>
                <div className="text-ink-secondary">
                  <strong>DATE:</strong> 17 Sep 2026
                </div>
                <div className="p-2 bg-amber-100/80 border-l-2 border-amber-600 rounded text-amber-950 font-semibold my-2">
                  Total Amount: ₹45,000 (INR 45,000)
                </div>
                <div className="text-ink-muted text-[10px]">
                  Payment Due Date: 17 Oct 2026
                </div>
              </div>
            </div>

            {/* 2. Extracted Information */}
            <div className="lg:col-span-4 p-5 bg-surface">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-semibold mb-3">
                2. Extracted Entities
              </div>
              <div className="space-y-2.5 text-left">
                <div className="p-2.5 rounded border border-border bg-canvas">
                  <div className="text-[10px] font-mono text-ink-muted uppercase">Document Number</div>
                  <div className="text-xs font-mono font-bold text-ink">INV-2026-1042</div>
                </div>
                <div className="p-2.5 rounded border border-accent-subtle bg-accent-faint">
                  <div className="text-[10px] font-mono text-accent uppercase font-semibold">Total Amount</div>
                  <div className="text-xs font-mono font-bold text-accent">₹45,000</div>
                </div>
                <div className="p-2.5 rounded border border-border bg-canvas">
                  <div className="text-[10px] font-mono text-ink-muted uppercase">Issue Date</div>
                  <div className="text-xs font-mono font-bold text-ink">17 Sep 2026</div>
                </div>
                <div className="p-2.5 rounded border border-border bg-canvas">
                  <div className="text-[10px] font-mono text-ink-muted uppercase">Organization</div>
                  <div className="text-xs font-mono font-bold text-ink">Example Pvt Ltd</div>
                </div>
              </div>
            </div>

            {/* 3. AI Answer & Grounded Source */}
            <div className="lg:col-span-4 p-5 bg-canvas/40 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-semibold mb-3">
                  3. Verified Q&A Answer
                </div>
                <div className="p-3 bg-surface rounded border border-border shadow-subtle mb-3 text-left">
                  <div className="text-[10px] font-mono text-ink-muted mb-1">USER QUERY</div>
                  <div className="text-xs font-medium text-ink">&ldquo;What is the total amount?&rdquo;</div>
                </div>

                <div className="p-3 bg-surface rounded border border-border shadow-subtle text-left space-y-2">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">AI Answer</span>
                    <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded">Grounded</span>
                  </div>
                  <p className="text-xs font-serif text-ink leading-relaxed">
                    The total amount payable is <strong>₹45,000</strong>.
                  </p>
                </div>
              </div>

              {/* Source link */}
              <div className="mt-4 p-3 bg-accent-faint border border-accent-subtle rounded text-left">
                <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-accent mb-1">
                  <span>SOURCE REFERENCE: PAGE 1</span>
                  <span className="underline cursor-pointer flex items-center gap-0.5">
                    View source <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <p className="text-[11px] font-mono text-ink-secondary">
                  &ldquo;Total Amount: ₹45,000 (INR 45,000)&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Principles */}
      <section className="border-t border-border bg-surface py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-ink">
              Engineered for High-Stakes Evidence Verification
            </h2>
            <p className="mt-2 text-sm text-ink-secondary font-sans max-w-xl mx-auto">
              Conventional chatbots guess. Proofline structures, indexes, and cites every sentence directly from your records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-lg border border-border bg-canvas/50">
              <div className="w-10 h-10 rounded bg-ink text-white flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-ink mb-2">
                Page-Level Segmentation
              </h3>
              <p className="text-xs text-ink-secondary font-sans leading-relaxed">
                PDF documents and scans are parsed deterministically page-by-page. Every extracted word maintains its original page coordinate for instant inspection.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-canvas/50">
              <div className="w-10 h-10 rounded bg-accent text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-ink mb-2">
                Strict Grounding Directives
              </h3>
              <p className="text-xs text-ink-secondary font-sans leading-relaxed">
                Google Gemini is strictly constrained to answer using only supplied document context. If a detail cannot be proven from the text, the system explicitly refuses to invent facts.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-canvas/50">
              <div className="w-10 h-10 rounded bg-ink text-white flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-lg font-bold text-ink mb-2">
                Tenant Ownership Isolation
              </h3>
              <p className="text-xs text-ink-secondary font-sans leading-relaxed">
                Enterprise security by design. Hashed authentication, signed JWT tokens, and strict database query boundaries ensure users can never access records outside their account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-canvas py-8 px-4 text-center text-xs font-mono text-ink-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial font-bold text-sm text-ink">PROOFLINE</span>
            <span>—</span>
            <span>Turn documents into answers you can verify.</span>
          </div>
          <div>
            <span>FastAPI • Next.js • PostgreSQL • Google Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
