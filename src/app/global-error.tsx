"use client";

import { useEffect } from "react";

/**
 * Root error boundary. Catches client-side exceptions thrown anywhere in the
 * tree — including the wallet providers in the root layout — so a single failing
 * component can never blank the whole site with Next's bare white "Application
 * error: a client-side exception has occurred" screen. It replaces the layout
 * entirely, so it must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real cause in the console for debugging.
    console.error(error);
    // Self-heal: most root-level crashes here come from stale wallet state
    // persisted in localStorage (a connector from an old release that no longer
    // exists, which makes wagmi throw on `uid` during rehydrate). Clear the
    // wallet/wagmi/WalletConnect storage once per browser session and reload —
    // guarded so a genuinely persistent error can't cause a reload loop.
    try {
      const HEAL_KEY = "pork:selfheal:v1";
      if (!sessionStorage.getItem(HEAL_KEY)) {
        sessionStorage.setItem(HEAL_KEY, "1");
        const drop = /^(wagmi|pork\.wagmi|rk-|wc@|walletconnect|WALLETCONNECT|W3M|@w3m|@appkit)/i;
        for (const k of Object.keys(localStorage)) {
          if (drop.test(k)) localStorage.removeItem(k);
        }
        window.location.reload();
      }
    } catch {
      /* storage unavailable (private mode) — fall through to the manual UI */
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff3fa",
          color: "#18181b",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            width: "100%",
            textAlign: "center",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "1.25rem",
            padding: "2rem",
            boxShadow: "0 20px 60px rgba(236,14,123,0.12)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#52525b" }}>
            The app hit an unexpected error. This is usually temporary — try
            reloading.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              padding: "0.7rem 1.5rem",
              borderRadius: "9999px",
              border: "none",
              background: "#ec0e7b",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
