"use client";

/**
 * Wallet connect is temporarily removed (see src/app/providers.tsx). Until the
 * new wallet integration is built, this is a static, non-interactive placeholder
 * that keeps the header layout intact. The `variant` API is unchanged so callers
 * (SiteHeader) don't need to change.
 */
export function WalletButton({ variant = "solid" }: { variant?: "inline" | "solid" }) {
  const inline = variant === "inline";
  const cls = inline
    ? "rounded-full px-4 py-2 text-sm font-semibold text-zinc-400 cursor-not-allowed"
    : "rounded-full bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-500 cursor-not-allowed";

  return (
    <button type="button" className={cls} disabled title="Wallet connect coming soon">
      Connect soon
    </button>
  );
}
