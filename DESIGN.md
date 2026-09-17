# Design System & Aesthetics: Proofline

> **Design Theme**: Documents, Evidence, Analysis, Verification.

---

## 1. Design Philosophy

Proofline rejects generic, flashy "AI SaaS" templates. Document analysis is an analytical, high-stakes endeavor where clarity, trustworthiness, and visual calm are paramount.

### What Proofline AVOIDS:
- ❌ Purple and blue saturated AI gradients
- ❌ Glowing cards and neon borders
- ❌ Blurred frosted-glass backdrops everywhere
- ❌ Robot or brain clip art
- ❌ Sparkle icons on every button
- ❌ Meaningless fake dashboard analytics charts

### What Proofline EMBRACES:
- Clean, warm neutral surfaces inspired by archival paper and editorial layouts.
- High-contrast, crisp typography with deliberate editorial serifs for headers and ultra-legible grotesque sans for UI controls.
- Monospace styling for verifiable data: document IDs, dates, currency amounts, and hashes.
- Subtle 1px borders, restrained neutral shadows, and generous breathing room.
- Clear spatial hierarchy connecting answers to source documents.

---

## 2. Color Palette & Tokens

| Token | Hex Value | Role |
|---|---|---|
| `canvas` | `#FBFBFA` | Warm neutral page background (archival paper feel) |
| `surface` | `#FFFFFF` | Crisp white cards and panel backgrounds |
| `surface-subtle` | `#F4F4F0` | Secondary backgrounds, tabs, table headers |
| `border` | `#E6E6E0` | Subtle, clean component dividing lines |
| `border-focus` | `#1C1917` | High-contrast focus state border |
| `text-primary` | `#1C1917` | Near-black ink for primary content & headings |
| `text-secondary`| `#71716A` | Neutral body & secondary labels |
| `text-muted` | `#A1A19A` | Timestamps, metadata, hints |
| `accent` | `#C2410C` | Deep terracotta / warm ember accent for primary CTA & citations |
| `accent-subtle` | `#FFEDD5` | Citation badge background and source highlight tint |
| `success` | `#15803D` | Verified badges and "Ready" document status |
| `warning` | `#B45309` | "Processing" document status |
| `danger` | `#DC2626` | Deletion and error alerts |

---

## 3. Typography

- **Display & Headings**: `Newsreader` / `Playfair Display` (Classic, trustworthy editorial serif)
- **UI & Body**: `Inter` / `system-ui` (Modern, legible, neutral sans-serif)
- **Data & Verification**: `JetBrains Mono` / `ui-monospace` (Precise tabular numbers, amounts, IDs)

---

## 4. Layout Architecture

### 4.1 Desktop: 3-Column Verification Workspace
```
┌────────────────────────────────────────────────────────────────────────┐
│ WorkspaceHeader (Title, Document ID, Status, Back, Actions)            │
├───────────────────┬──────────────────────┬─────────────────────────────┤
│ PANEL 1           │ PANEL 2              │ PANEL 3                     │
│ Document Viewer   │ Extracted Content    │ AI Analysis & Q&A           │
│                   │                      │                             │
│ • Page Navigator  │ • Entity Grid        │ • Executive Summary         │
│ • Zoom Controls   │   - Doc Number       │ • Key Points Bullets        │
│ • Full Document   │   - Issue / Due Date │ • Suggested Questions       │
│   Canvas          │   - Financial Totals │ • Interactive Chat Stream   │
│ • Text Highlight  │   - Organizations    │ • Verifiable Source Cards   │
│   Overlay         │ • Page-by-Page Text  │   (Click to jump to Page)   │
└───────────────────┴──────────────────────┴─────────────────────────────┘
```

### 4.2 Tablet: 2-Column Responsive Layout
- Column 1: Document Viewer
- Column 2: Tabbed switch between Extracted Entities and AI Analysis

### 4.3 Mobile: Stacked Verification View
- Tabbed interface switching seamlessly between:
  1. `[Document]`
  2. `[Entities]`
  3. `[Summary]`
  4. `[Ask AI]`
- Touch-friendly action buttons, persistent input bar, and clean scrolling.

---

## 5. Micro-Interactions & Feedback

- **Interactive Citation Jump**: Clicking a source reference badge smoothly scrolls the document viewer to the cited page and briefly pulses a warm amber highlight around the referenced passage.
- **5-Stage Timeline**: Clear visual steps showing document digestion progress (`Uploading` → `Reading` → `Extracting` → `Analyzing` → `Ready`).
- **Empty States**: Encouraging, calm empty states offering sample documents with 1-click test ingestion.
