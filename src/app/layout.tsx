import type { Metadata, Viewport } from "next";
import "@rainbow-me/rainbowkit/styles.css"; // REQUIRED, before globals — styles the connect modal
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WalletGate } from "@/components/WalletGate";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — cinematic AI launchpad`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    title: `${SITE.name} — cinematic AI launchpad`,
    description: SITE.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff3fa",
};

// Render at request time, not static export. This skips Next's static prerender
// step entirely, which is where wagmi/RainbowKit throws "reading 'uid'" — and
// makes the build immune to stale Vercel build caches. (viem is also deduped via
// package.json overrides so the runtime never hits that bug either.)
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are loaded at runtime by the browser (not fetched at build),
          so a build never depends on reaching Google Fonts. The CSS variables
          in globals.css list a full system fallback stack, so the site looks
          right even if these never load.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="cinema-bg" aria-hidden />
        <div className="grain" aria-hidden />
        <Providers>
          <div className="flex min-h-dvh flex-col overflow-x-hidden">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <WalletGate />
        </Providers>
      </body>
    </html>
  );
}
