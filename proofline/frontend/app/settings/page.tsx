"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { Settings, User as UserIcon, Key, LogOut, Save, Loader2, Check, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await authApi.updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 w-full">
      {/* Header */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-accent" />
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-ink">
            Settings
          </h1>
        </div>
        <p className="text-sm text-ink-secondary">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-ink-muted" />
          <h2 className="text-sm font-medium text-ink">Profile</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-ink"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border rounded text-ink-muted cursor-not-allowed"
            />
            <p className="text-[10px] text-ink-muted mt-1">Email cannot be changed.</p>
          </div>

          {error && (
            <div className="px-3 py-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-ink text-white rounded shadow-subtle hover:bg-ink-secondary disabled:opacity-50 transition-all"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saved ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
          </button>
        </form>
      </section>

      {/* Account Info */}
      <section className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Shield className="w-4 h-4 text-ink-muted" />
          <h2 className="text-sm font-medium text-ink">Account</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-[10px] font-mono text-ink-muted uppercase">Account ID</dt>
              <dd className="text-xs text-ink-secondary mt-0.5 font-mono">
                {user?.id?.slice(0, 8) || "—"}...
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-mono text-ink-muted uppercase">Member since</dt>
              <dd className="text-xs text-ink-secondary mt-0.5">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
          </div>
        </div>
      </section>

      {/* API Key Section (for Gemini) */}
      <section className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Key className="w-4 h-4 text-ink-muted" />
          <h2 className="text-sm font-medium text-ink">AI Configuration</h2>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-ink-secondary leading-relaxed">
            Proofline uses <strong>Google Gemini</strong> for AI features. The API key is
            configured server-side. Contact your administrator if AI features are
            unavailable.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-ink-secondary">AI service available</span>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-surface border border-red-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-red-200">
          <h2 className="text-sm font-medium text-red-600">Danger zone</h2>
        </div>
        <div className="p-5">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out of Proofline
          </button>
        </div>
      </section>
    </div>
  );
}
