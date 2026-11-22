import type { Mod } from "@/types/database";

interface BuildSummaryProps {
  mods: Mod[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function BuildSummary({ mods }: BuildSummaryProps) {
  const installedCost = mods
    .filter((mod) => mod.status === "Installed")
    .reduce((total, mod) => total + mod.cost, 0);
  const wishlistCost = mods
    .filter((mod) => mod.status === "Wishlist")
    .reduce((total, mod) => total + mod.cost, 0);

  return (
    <section
      aria-label="Build cost summary"
      className="grid gap-4 sm:grid-cols-2"
    >
      <article className="rounded-2xl border border-white/10 bg-[#131819] p-5">
        <p className="text-sm font-medium text-zinc-400">Installed Cost</p>
        <p className="mt-2 text-2xl font-semibold text-lime-300">
          {currencyFormatter.format(installedCost)}
        </p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-[#131819] p-5">
        <p className="text-sm font-medium text-zinc-400">Wishlist Cost</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {currencyFormatter.format(wishlistCost)}
        </p>
      </article>
    </section>
  );
}
