import Link from "next/link";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";

const PRODUCT = [
  { href: "/feed", label: "Explore" },
  { href: "/create", label: "Create" },
  { href: "/docs", label: "Docs" },
] as const;

const LEGAL = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-ink-line">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + blurb */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Logo className="h-7 w-7" />
              <span className="font-display text-xl font-bold text-white">{SITE.name}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              Launch and explore AI-generated tokens on {SITE.chain}. Your wallet submits every
              transaction. {SITE.name} does not custody assets.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="eyebrow">Product</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {PRODUCT.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-zinc-400 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="eyebrow">Legal</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-zinc-400 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk notice */}
        <div className="mt-12">
          <h3 className="eyebrow">Risk notice</h3>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-500">
            {SITE.name} is a non-custodial, third-party interface to the {SITE.poweredBy} protocol.
            Transactions are submitted through your wallet and may be irreversible. Tokens can be
            volatile or lose all value. {SITE.name} does not provide custody, warranties, or
            financial advice, and is not an official {SITE.poweredBy} product.
          </p>
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-col gap-4 border-t border-ink-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            © {year} {SITE.company}
          </p>
          <div className="flex items-center gap-4">
            <a
              href={SITE.x}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
            >
              {SITE.xHandle}
            </a>
            <a
              href={SITE.x}
              target="_blank"
              rel="noreferrer"
              aria-label="Pork on X"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-line text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
