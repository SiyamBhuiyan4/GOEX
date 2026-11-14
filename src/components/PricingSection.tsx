import { useQuery } from "convex/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { ZONE, ZONES, ZONE_TIME, num, tk } from "../lib/format";
import { navigate } from "../lib/router";
import { t } from "../lib/prefs";
import { Button, cx } from "./ui";

/*
  Delivery prices on the home page. Read live from the same rates the admin
  edits under Delivery rates, so the page always matches what merchants are
  charged — nothing here is typed in by hand.
*/

type Rates = NonNullable<typeof api.settings.publicRates._returnType>;
type Zone = (typeof ZONES)[number];

const BASE: Record<Zone, (r: Rates) => number> = {
  uttara: (r) => r.uttara,
  dhaka_city: (r) => r.dhakaCity,
  gazipur_city: (r) => r.gazipurCity,
  narayanganj_city: (r) => r.narayanganjCity,
};
const INSIDE: Record<Zone, boolean> = { uttara: true, dhaka_city: true, gazipur_city: false, narayanganj_city: false };

const pct = (n: number) => `${num(n)}%`;

export function PricingSection() {
  const r = useQuery(api.settings.publicRates);
  const cheapest = r ? Math.min(...ZONES.map((z) => BASE[z](r))) : 0;

  return (
    <section id="pricing" className="scroll-mt-6 border-y border-line bg-surface py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">{t("Pricing")}</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Simple, clear delivery charges")}</h2>
          <p className="mt-3 text-ink-2">{t("One price per area for parcels up to 1 kg. Opening a merchant account is free.")}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ZONES.map((z) => {
            const price = r ? BASE[z](r) : undefined;
            const best = r && price === cheapest;
            const extra = r ? (INSIDE[z] ? r.extraPerKg : r.extraPerKgOutside) : undefined;
            const cod = r ? (INSIDE[z] ? r.codPercent : r.codPercentOutside) : undefined;
            return (
              <div
                key={z}
                className={cx(
                  "flex flex-col rounded-3xl p-6 ring-1 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]",
                  best ? "bg-brand-50 ring-brand/40 dark:bg-brand/10" : "bg-page ring-line",
                )}
              >
                <p className="font-bold">{ZONE[z]}</p>
                <p className="mt-0.5 text-xs font-semibold text-brand">{ZONE_TIME[z]}</p>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight">{price === undefined ? "…" : tk(price)}</span>
                  <span className="text-sm text-ink-3">{t("up to 1 kg")}</span>
                </p>
                <ul className="mt-5 space-y-2 border-t border-dashed border-line pt-4 text-sm text-ink-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-brand" />
                    {extra === undefined ? "…" : `+${tk(extra)} ${t("per extra kg")}`}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-brand" />
                    {cod === undefined ? "…" : cod === 0 ? t("No COD charge") : `${pct(cod)} ${t("COD charge")}`}
                  </li>
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-page p-5 ring-1 ring-line sm:flex-row">
          <p className="text-sm text-ink-2">
            {r ? `${t("Returned parcel:")} ${pct(r.returnPercent)} ${t("of the delivery charge.")} ` : ""}
            {t("Exact charges are shown before you confirm each parcel.")}
          </p>
          <Button onClick={() => navigate("/register")} className="shrink-0">
            {t("Start sending")} <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
