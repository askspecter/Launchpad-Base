import Link from "next/link";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-5 w-5" />
          <span className="text-zinc-400">{SITE.name}</span>
          <span className="text-zinc-600">— {SITE.tagline}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/create" className="hover:text-white">Launch</Link>
          <Link href="/feed" className="hover:text-white">Feed</Link>
          <a href={SITE.x} target="_blank" rel="noreferrer" className="hover:text-white">X</a>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-[11px] leading-relaxed text-zinc-600">
        {SITE.name} is a non-custodial, third-party interface to the {SITE.poweredBy} protocol on{" "}
        {SITE.chain}. Every transaction is signed by your own wallet. Not financial advice, and not an
        official {SITE.poweredBy} product. Tokens can lose all value.
      </p>
    </footer>
  );
}
