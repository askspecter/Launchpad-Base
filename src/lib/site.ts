/** Shared site constants (links, copy). */
export const SITE = {
  name: "Pork",
  tagline: "One line in. A token out.",
  description:
    "Cinematic AI launchpad. Describe a token in one sentence, watch the full launch package render, and deploy to Pons on Robinhood Chain, non-custodial.",
  x: "https://x.com/porkdotworks",
  chain: "Robinhood Chain",
  poweredBy: "Pons",
} as const;

export const NAV = [
  { href: "/create", label: "Launch" },
  { href: "/feed", label: "Feed" },
] as const;
