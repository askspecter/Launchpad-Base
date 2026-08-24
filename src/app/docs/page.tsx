import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="eyebrow">Docs</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-white">How {SITE.name} works</h1>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-400">
        <section>
          <h2 className="font-display text-lg font-semibold text-white">One sentence, one token</h2>
          <p className="mt-2">
            Describe your idea in a single line. {SITE.name}&apos;s AI drafts the full launch package,
            a name, ticker, logo, description, lore, a ready-to-post X thread, and meme prompts, then
            recommends a launch model. You can edit everything before deploying.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">Launch models</h2>
          <ul className="mt-2 space-y-2">
            <li>
              <span className="text-white">v1 — Instant Pool.</span> One transaction deploys the token
              and a Uniswap V3 pool (WETH), locked immediately. Tradable at launch. Open to everyone.
            </li>
            <li>
              <span className="text-white">v2 — Bonding Curve.</span> A fair launch on a bonding curve
              that graduates to Uniswap V4, with support for RWA quote pairs. Creators are paid in ETH.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">Non-custodial</h2>
          <p className="mt-2">
            {SITE.name} is a third-party interface to the {SITE.poweredBy} protocol on {SITE.chain}.
            Every transaction is signed by your own wallet, {SITE.name} never holds your funds or keys.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">Get started</h2>
          <p className="mt-2">
            Head to{" "}
            <Link href="/create" className="text-pink underline-offset-4 hover:underline">
              Create
            </Link>{" "}
            to launch, or browse{" "}
            <Link href="/feed" className="text-pink underline-offset-4 hover:underline">
              Explore
            </Link>{" "}
            to see recent launches.
          </p>
        </section>
      </div>
    </div>
  );
}
