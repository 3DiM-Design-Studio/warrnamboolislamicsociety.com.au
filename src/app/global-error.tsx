"use client";

// Last safety net: used only if the whole page frame (layout) itself fails. It cannot use the site's styles.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f4f0", color: "#121512", fontFamily: "system-ui, sans-serif", padding: 16 }}>
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <h1 style={{ fontSize: 26, margin: 0 }}>Something went wrong on our side</h1>
          <p style={{ color: "#5f655e", lineHeight: 1.5 }}>This is not your fault. Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 12, padding: "12px 24px", borderRadius: 999, border: 0, background: "#c9f26b", color: "#0b0d0b", fontWeight: 600, fontSize: 16, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
