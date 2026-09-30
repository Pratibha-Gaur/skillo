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
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#F7F6F1",
            color: "#17231D",
            fontFamily: "system-ui, sans-serif",
            padding: 24,
          }}
        >
          <div style={{ maxWidth: 520, textAlign: "center" }}>
            <p style={{ color: "#167052", fontWeight: 800 }}>
              Skillo hit a problem
            </p>
            <h1 style={{ fontSize: 36, lineHeight: 1.1, margin: "12px 0" }}>
              This page could not be loaded.
            </h1>
            <p style={{ color: "#617068", lineHeight: 1.7 }}>
              Your data has not been replaced with a fake success state. Try the
              request again, and contact support if it keeps happening.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: 24,
                border: 0,
                borderRadius: 10,
                background: "#167052",
                color: "white",
                fontWeight: 800,
                padding: "12px 18px",
                cursor: "pointer",
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
