"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { WalletButton } from "./WalletButton";
import { SITE, NAV } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-ink-900/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logo className="h-8 w-8 transition group-hover:scale-105" />
          <span className="font-display text-xl font-bold tracking-tight text-white">
            {SITE.name}
          </span>
          <span className="hidden rounded-full border border-ink-line px-2 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">
            on {SITE.poweredBy}
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="ml-1.5">
            <WalletButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
