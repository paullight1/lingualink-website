"use client";

// Root-level fallback — catches errors thrown by the root layout itself, so it must
// render its own <html>/<body> (no design-system providers are guaranteed to be mounted).
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: "#1a0800",
          color: "#f8f9fa",
        }}
      >
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            backgroundImage: "linear-gradient(90deg, #FF8A00, #FF5F00)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          LinguaLink
        </div>
        <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>
          Something went wrong
        </p>
        <p style={{ maxWidth: 320, fontSize: "0.9rem", color: "rgba(248,249,250,0.7)" }}>
          A critical error occurred. Please try reloading the app.
        </p>
        <button
          onClick={() => reset()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            borderRadius: "9999px",
            padding: "0.75rem 1.5rem",
            fontWeight: 600,
            fontSize: "0.95rem",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            backgroundImage: "linear-gradient(90deg, #FF8A00, #FF5F00)",
            boxShadow: "0 8px 24px rgba(255, 138, 0, 0.3)",
          }}
        >
          <RefreshCw size={18} />
          Reload
        </button>
      </body>
    </html>
  );
}
