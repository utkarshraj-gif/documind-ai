import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ResponsiveNavigation } from "@/components/ResponsiveNavigation";

export const metadata: Metadata = {
  title: "Proofline | Turn documents into answers you can verify",
  description:
    "Grounded AI document intelligence. Extract structured entities, summarize complex records, and ask natural language questions backed by verifiable source citations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink flex flex-col antialiased selection:bg-accent-subtle selection:text-ink">
        <AuthProvider>
          <ResponsiveNavigation />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
