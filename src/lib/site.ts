/** Shared site constants (links, copy). */
export const SITE = {
  name: "Pork",
  tagline: "One line in. A token out.",
  description:
    "Cinematic AI launchpad. Say it in a sentence, watch the full launch package render, and deploy to Pons on Robinhood Chain, non-custodial.",
  x: "https://x.com/rhpork",
  chain: "Robinhood Chain",
  poweredBy: "Pons",
} as const;

export const NAV = [
  { href: "/create", label: "Launch" },
  { href: "/feed", label: "Feed" },
] as const;
