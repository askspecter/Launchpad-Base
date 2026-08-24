import Link from "next/link";
import { SITE } from "@/lib/site";

const RWA = ["ETH", "USDG", "NVDA", "AAPL", "TSLA", "HOOD", "COIN", "META", "AMZN", "MSFT", "GOOGL", "SPY"];

const STEPS = [
  { n: "01", t: "Say the word", d: "Type one sentence. Pork's AI drafts a name, ticker, logo, description, lore, a ready-to-post X thread, and meme prompts." },
  { n: "02", t: "Pick the model", d: "v1 instant Uniswap V3 pool, or v2 bonding curve that graduates to V4. AI recommends, you decide." },
  { n: "03", t: "Deploy to Pons", d: "One signed transaction from your own wallet. The token launches straight onto the Pons protocol." },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="relative flex flex-col items-center pt-20 text-center sm:pt-28">
        <span className="chip chip-accent animate-fade-up">
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-rose shadow-[0_0_8px_#ff3d7f]" />
          AI launchpad on {SITE.chain}
        </span>

        <h1 className="mt-6 animate-fade-up font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-7xl">
          One line in.
          <br />
          <span className="grad-text">A token out.</span>
        </h1>

        <p className="mt-6 max-w-xl animate-fade-up text-balance text-base text-zinc-400 sm:text-lg">
          {SITE.name} turns a single sentence into a complete, launch-ready token, then deploys it to
          the <span className="text-zinc-200">{SITE.poweredBy}</span> launchpad. Non-custodial,
          cinematic, and fast.
        </p>

        <div className="mt-8 flex animate-fade-up flex-col items-center gap-3 sm:flex-row">
          <Link href="/create" className="btn-brand !px-7 !py-3.5 text-base">
            Launch a token →
          </Link>
          <Link href="/feed" className="btn-ghost !px-7 !py-3.5 text-base">
            Watch the feed
          </Link>
        </div>

        <p className="mt-4 text-xs text-zinc-600">No sign-up. Your wallet signs every transaction.</p>
      </section>

      {/* Marquee of quote assets */}
      <div className="marquee-mask mt-16 overflow-hidden py-4">
        <div className="marquee-track gap-3">
          {[...RWA, ...RWA].map((s, i) => (
            <span key={i} className="chip whitespace-nowrap px-3 py-1 text-xs">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="mt-16">
        <div className="grad-rule mx-auto mb-10 h-px w-40" />
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card card-hover p-6">
              <div className="step-badge">{s.n}</div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Model comparison */}
      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-white">v1 · Instant Pool</h3>
            <span className="chip">open</span>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            One transaction deploys the token and a Uniswap V3 pool, locked immediately and quoted in
            WETH. Tradable from block one. Anyone can launch.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-zinc-300">
            <li>· Fixed supply, 1% pool fee</li>
            <li>· Flat 0.0005 ETH launch fee</li>
            <li>· No whitelist</li>
          </ul>
        </div>
        <div className="card p-6 shadow-glow">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-white">v2 · Bonding Curve</h3>
            <span className="chip chip-accent">RWA pairs</span>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            Fair launch on a bonding curve that graduates into a locked Uniswap V4 pool. Pair against
            ETH or tokenized stocks. Creators are paid in ETH.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-zinc-300">
            <li>· Graduates to V4 automatically</li>
            <li>· ETH / USDG / NVDA / AAPL / HOOD…</li>
            <li>· Optional protocol buyback</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 overflow-hidden rounded-3xl border border-ink-line p-10 text-center shadow-card"
        style={{ background: "radial-gradient(40rem 20rem at 50% -20%, rgba(255,61,127,0.18), transparent 70%)" }}>
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Your next launch is <span className="grad-text">one sentence</span> away.
        </h2>
        <Link href="/create" className="btn-brand mt-6 inline-flex !px-8 !py-3.5 text-base">
          Open the studio →
        </Link>
      </section>
    </div>
  );
}
