"use client";

import { useEffect } from "react";

export default function AppGlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          color: "#0f172a",
          backgroundColor: "#fff",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ maxWidth: "32rem", color: "#64748b", margin: 0 }}>
          The app failed to load. Try reloading the page. If this keeps happening, contact
          support.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre
            style={{
              maxWidth: "48rem",
              overflow: "auto",
              borderRadius: "0.375rem",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              padding: "0.75rem",
              fontSize: "0.75rem",
              textAlign: "left",
            }}
          >
            {error.message}
            {error.digest ? `\n\nDigest: ${error.digest}` : ""}
          </pre>
        )}
        <button
          onClick={() => reset()}
          type="button"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            backgroundColor: "#0f172a",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
