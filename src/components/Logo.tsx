import Image from "next/image";

/**
 * Pork brand mark — the pink ribbon "P". The source art sits on white, so we
 * render it inside a white rounded badge; the baked-in white blends into the
 * badge and the mark reads cleanly on any (dark) background.
 */
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-xl bg-white ${className}`}
    >
      <Image
        src="/pork-logo.png"
        alt="Pork"
        width={96}
        height={96}
        className="h-full w-full object-contain p-[12%]"
        priority
      />
    </span>
  );
}
