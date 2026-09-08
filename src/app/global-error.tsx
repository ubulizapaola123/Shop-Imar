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
            <h1>Something went wrong</h1>
            <p>We could not load the dashboard. Please try again.</p>
            <button type="button" onClick={reset} style={{ background: "#FF6600", border: 0, borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: 600, marginTop: "12px", padding: "12px 20px" }}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
