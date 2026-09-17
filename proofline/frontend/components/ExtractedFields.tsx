import React from "react";
import { ExtractedEntities } from "@/types";
import { Hash, Calendar, Building2, User as UserIcon, MapPin, DollarSign, Tag } from "lucide-react";

interface ExtractedFieldsProps {
  entities?: ExtractedEntities | null;
  className?: string;
  onFilterKeyword?: (keyword: string) => void;
}

export function ExtractedFields({ entities, className, onFilterKeyword }: ExtractedFieldsProps) {
  if (!entities) {
    return (
      <div className="p-4 rounded border border-border bg-surface text-center text-xs text-ink-muted">
        No structured entities extracted yet.
      </div>
    );
  }

  const sections = [
    {
      title: "Document Number",
      icon: Hash,
      items: entities.document_numbers,
      highlight: true,
      emptyText: "No document number detected",
    },
    {
      title: "Amounts & Financials",
      icon: DollarSign,
      items: entities.amounts,
      highlight: true,
      emptyText: "No currency amounts detected",
    },
    {
      title: "Key Dates",
      icon: Calendar,
      items: entities.dates,
      highlight: false,
      emptyText: "No dates detected",
    },
    {
      title: "Organizations",
      icon: Building2,
      items: entities.organizations,
      highlight: false,
      emptyText: "No organizations detected",
    },
    {
      title: "People & Signatories",
      icon: UserIcon,
      items: entities.person_names,
      highlight: false,
      emptyText: "No person names detected",
    },
    {
      title: "Addresses",
      icon: MapPin,
      items: entities.addresses,
      highlight: false,
      emptyText: "No addresses detected",
    },
  ];

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-accent" />
          Extracted Entities
        </h3>
        <span className="text-[10px] font-mono text-ink-muted bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle">
          {entities.document_type || "Document"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const hasItems = sec.items && sec.items.length > 0;

          return (
            <div
              key={sec.title}
              className="p-3 rounded border border-border bg-surface hover:border-border-dark transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3.5 h-3.5 text-ink-muted" />
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-ink-secondary">
                  {sec.title}
                </span>
              </div>

              {hasItems ? (
                <div className="flex flex-wrap gap-1.5">
                  {sec.items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onFilterKeyword && onFilterKeyword(item)}
                      title={onFilterKeyword ? `Search "${item}" in viewer` : undefined}
                      className={`text-xs font-mono px-2 py-1 rounded border text-left transition-all ${
                        sec.highlight
                          ? "bg-accent-faint text-accent border-accent-subtle font-semibold hover:border-accent"
                          : "bg-surface-subtle text-ink border-border-subtle hover:border-border hover:bg-surface"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] font-mono text-ink-muted italic">
                  {sec.emptyText}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
