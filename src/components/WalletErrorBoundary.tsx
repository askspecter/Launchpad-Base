"use client";

import { Component, type ReactNode } from "react";

/**
 * Guards the wallet provider subtree. If wagmi/RainbowKit throws while mounting
 * on the client (e.g. a connector fails to initialize), we render the app
 * WITHOUT the wallet stack instead of blanking the whole page with a
 * "client-side exception". The wallet button then shows its placeholder.
 */
export class WalletErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Surfaced in the browser console for diagnosis; non-fatal for the page.
    console.error("[Pork] wallet stack failed to mount:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
