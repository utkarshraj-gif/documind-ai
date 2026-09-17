"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signup({
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-canvas">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-ink text-white flex items-center justify-center mx-auto mb-3 font-editorial font-bold text-lg">
            P
          </div>
          <h1 className="font-editorial text-2xl font-bold text-ink">
            Create your account
          </h1>
          <p className="mt-1 text-xs text-ink-secondary">
            Join Proofline to start analyzing and verifying documents
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink-secondary mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink-secondary mb-1">
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink-secondary mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-ink-secondary mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-ink text-white font-medium text-sm rounded shadow-subtle hover:bg-ink-secondary disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Sign up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-ink-secondary">
          Already have an account?{" "}
          <a href="/login" className="text-accent font-semibold hover:underline">
            Log in here
          </a>
        </div>
      </div>
    </div>
  );
}
