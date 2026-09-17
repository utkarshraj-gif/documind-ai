"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  FileText,
  Compass,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

export function ResponsiveNavigation() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on landing page and not authenticated, show landing nav
  const isLanding = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return null;
  }

  const navItems = [
    { label: "Workspace", href: "/dashboard", icon: Compass },
    { label: "Documents", href: "/documents", icon: FolderOpen },
    { label: "Assistant", href: "/assistant", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-canvas/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <a href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-ink text-canvas flex items-center justify-center font-editorial text-lg font-bold shadow-subtle group-hover:bg-accent transition-colors">
              P
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-editorial text-xl font-bold tracking-tight text-ink">
                  PROOFLINE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>
              <span className="text-[10px] tracking-wider uppercase font-mono text-ink-muted -mt-1">
                Verified Intelligence
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-surface text-ink border border-border shadow-subtle"
                        : "text-ink-secondary hover:text-ink hover:bg-surface-subtle"
                    )}
                  >
                    <Icon className="w-4 h-4 text-ink-muted" />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-3 border-l border-border">
                <div className="w-7 h-7 rounded-full bg-accent-subtle text-accent font-semibold text-xs flex items-center justify-center font-mono">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-ink leading-none">{user?.name}</span>
                  <span className="text-[10px] font-mono text-ink-muted truncate max-w-[120px]">
                    {user?.email}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-subtle rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="text-sm font-medium text-ink-secondary hover:text-ink px-3 py-1.5 rounded hover:bg-surface-subtle transition-colors"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="text-sm font-medium bg-ink text-white px-4 py-2 rounded shadow-subtle hover:bg-ink-secondary transition-colors"
              >
                Get Started
              </a>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink-secondary hover:text-ink rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-canvas px-4 pt-2 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="p-3 bg-surface rounded-md border border-border flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-accent-subtle text-accent font-semibold text-sm flex items-center justify-center font-mono">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ink">{user?.name}</span>
                  <span className="text-xs font-mono text-ink-muted">{user?.email}</span>
                </div>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium",
                      isActive ? "bg-surface text-ink font-semibold" : "text-ink-secondary"
                    )}
                  >
                    <Icon className="w-5 h-5 text-ink-muted" />
                    {item.label}
                  </a>
                );
              })}
              <div className="pt-3 border-t border-border">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-medium text-ink bg-surface border border-border rounded-md"
              >
                Log in
              </a>
              <a
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-medium text-white bg-ink rounded-md"
              >
                Sign up
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
