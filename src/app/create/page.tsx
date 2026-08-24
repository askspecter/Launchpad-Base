"use client";

import { LaunchStudio } from "@/components/LaunchStudio";
import { useWalletReady } from "@/app/providers";

export default function CreatePage() {
  const ready = useWalletReady();

  // LaunchStudio (and DeployButton) call wagmi hooks, so they must not render
  // until the client-only wallet providers are mounted. Same gate as the rest
  // of the wallet stack — see providers.tsx.
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded-lg bg-black/[0.05]" />
          <div className="h-4 w-72 rounded bg-black/[0.04]" />
          <div className="mt-6 h-40 rounded-2xl border border-ink-line bg-black/[0.04]" />
          <div className="h-40 rounded-2xl border border-ink-line bg-black/[0.04]" />
        </div>
      </div>
    );
  }

  return <LaunchStudio />;
}
