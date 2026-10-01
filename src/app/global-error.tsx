"use client";

import { useEffect } from "react";

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
      <body>
        <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: "24px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
          <div>
            <h1 style={{ color: "#1F2937", fontSize: "24px", fontWeight: "bold" }}>Something went wrong</h1>
            <p style={{ color: "#6B7280", marginTop: "8px" }}>We could not load the dashboard. Please try again.</p>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#15803D",
                border: 0,
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                marginTop: "16px",
                padding: "10px 20px"
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
