import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Bike,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Copy,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Milk,
  PackageCheck,
  PackageSearch,
  Phone,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  ThumbsUp,
  Truck,
  Utensils,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Link, navigate } from "../lib/router";
import { useSession } from "../lib/session";
import { errorText, useToast } from "../lib/toast";
import { CATEGORY, PAYOUT_METHOD, STATUS, ZONE, dateTime, num, tk, type Category } from "../lib/format";
import { CONTACT } from "../lib/contact";
import { Button, Card, Field, Input, Logo, PasswordInput, Select, StatusBadge, Textarea, Wordmark, cx } from "../components/ui";
import { IS_ADMIN_PORTAL } from "../lib/portal";
import { Prefs } from "../components/Prefs";
import { t, translateServer } from "../lib/prefs";
import { RoadBandAnimation } from "../components/RoadBandAnimation";
import { NetworkMapAnimation } from "../components/NetworkMapAnimation";
import { GoexServices } from "../components/GoexServices";
import { QuickServiceModal } from "../components/QuickServiceModal";

/** Only same-site paths may be used as a post-login destination. */
export function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/app";
}
const nextParam = () => new URLSearchParams(location.search).get("next");

/* ------------------------------------------------------------------ nav */

function PublicNav({ onOpenQuickBooking }: { onOpenQuickBooking?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5">
      <Link href="/" className="flex shrink-0 items-center gap-3">
        <Logo size={46} className="ring-2 ring-white/25 shadow-lg" />
        <span className="hidden sm:block">
          <Wordmark dark />
        </span>
      </Link>
      <nav className="hidden items-center gap-1.5 sm:gap-2 lg:flex">
        <a href="/#services" className="rounded-xl px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white">
          {t("Services")}
        </a>
        <a href="/#pricing" className="rounded-xl px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white">
          {t("Pricing")}
        </a>
        <a href="/#join" className="rounded-xl px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white">
          {t("Join as rider")}
        </a>
        {onOpenQuickBooking && (
          <button
            type="button"
            onClick={onOpenQuickBooking}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand/25 px-3.5 py-1.5 text-xs font-bold text-sun ring-1 ring-brand/40 backdrop-blur-sm transition hover:bg-brand hover:text-white active:scale-95"
          >
            <Sparkles className="size-3.5" />
            <span>{t("Quick Booking")}</span>
          </button>
        )}
        <a
          href={`tel:${CONTACT.phone}`}
          className="flex items-center gap-1.5 rounded-xl bg-brand px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-brand/30 transition hover:bg-brand/90 hover:scale-[1.02]"
          title={`Hotline: ${CONTACT.phoneDisplay}`}
        >
          <Phone className="size-3.5" />
          <span>{CONTACT.phoneDisplay}</span>
        </a>
        <a
          href={CONTACT.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden xl:flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 hover:border-emerald-600"
          title={`WhatsApp: ${CONTACT.phoneDisplay}`}
        >
          <MessageCircle className="size-3.5 text-emerald-400" />
          <span>WhatsApp</span>
        </a>
        <a
          href={CONTACT.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden 2xl:flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 hover:border-blue-600"
          title="Official Facebook Page"
        >
          <ThumbsUp className="size-3.5 text-blue-400" />
          <span>Facebook</span>
        </a>
        <Prefs onDark />
        <Button onClick={() => navigate("/login")}>{t("Merchant login")}</Button>
      </nav>

      {/* Mobile controls */}
      <div className="flex items-center gap-2 lg:hidden">
        <a
          href={`tel:${CONTACT.phone}`}
          className="flex items-center gap-1 rounded-xl bg-brand px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand/90"
          title={`Hotline: ${CONTACT.phoneDisplay}`}
        >
          <Phone className="size-3" />
          <span className="hidden xs:inline sm:inline">{CONTACT.phoneDisplay}</span>
        </a>
        {onOpenQuickBooking && (
          <button
            type="button"
            onClick={onOpenQuickBooking}
            className="hidden rounded-xl bg-brand/25 px-2.5 py-1.5 text-xs font-bold text-sun ring-1 ring-brand/40 sm:block"
          >
            {t("Quick Booking")}
          </button>
        )}
        <Prefs onDark />
        <Button size="sm" onClick={() => navigate("/login")}>{t("Merchant login")}</Button>
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="grid size-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          aria-label={t("Menu")}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="animate-rise absolute inset-x-4 top-20 z-40 rounded-3xl border border-white/15 bg-navy-950/95 p-5 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1.5">
            <a
              href="/#services"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              {t("Services")}
            </a>
            <a
              href="/#pricing"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              {t("Pricing")}
            </a>
            <a
              href="/#join"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              {t("Join as rider")}
            </a>
            {onOpenQuickBooking && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenQuickBooking();
                }}
                className="flex items-center gap-2 rounded-xl bg-brand/20 px-4 py-2.5 text-sm font-bold text-sun transition hover:bg-brand hover:text-white text-left"
              >
                <Sparkles className="size-4" /> {t("Quick Booking")}
              </button>
            )}
            <div className="my-2 border-t border-white/10" />
            <a
              href={`tel:${CONTACT.phone}`}
              className="flex items-center justify-between rounded-xl bg-brand/20 px-4 py-2.5 text-sm font-bold text-brand transition hover:bg-brand/30"
            >
              <span className="flex items-center gap-2.5">
                <Phone className="size-4" /> {t("Hotline")}
              </span>
              <span>{CONTACT.phoneDisplay}</span>
            </a>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-emerald-600/20 px-4 py-2.5 text-sm font-bold text-emerald-400 transition hover:bg-emerald-600/30"
            >
              <span className="flex items-center gap-2.5">
                <MessageCircle className="size-4" /> WhatsApp
              </span>
              <span>{CONTACT.phoneDisplay}</span>
            </a>
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl bg-blue-600/20 px-4 py-2.5 text-sm font-bold text-blue-400 transition hover:bg-blue-600/30"
            >
              <ThumbsUp className="size-4" /> {t("Facebook page")}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function TrackBox({ big }: { big?: boolean }) {
  const [code, setCode] = useState("");
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const c = code.trim().toUpperCase();
          if (c) navigate(`/track/${encodeURIComponent(c)}`);
        }}
        className={cx("flex w-full gap-2 rounded-2xl bg-surface p-2 shadow-[var(--shadow-pop)]", big && "sm:p-2.5")}
      >
        <div className="flex flex-1 items-center gap-2 pl-3">
          <PackageSearch className="size-5 shrink-0 text-brand" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("Enter tracking ID, e.g. GX7K2Q9XPA")}
            className="h-11 w-full min-w-0 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-3"
            maxLength={20}
          />
        </div>
        <Button type="submit" size="lg" icon={Search}>
          {t("Track")}
        </Button>
      </form>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-white/55">
        <Lock className="size-3" /> {t("Merchants and riders can track their own parcels after logging in.")}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------- home */

const SERVICES: Category[] = [
  "parcel",
  "document",
  "food",
  "medicine",
  "shopping",
  "electronics",
  "cosmetics",
  "gift",
  "frozen",
  "bakery",
  "home",
  "business",
];

const COVERAGE = [
  "Savar Sadar",
  "Hemayetpur",
  "Ashulia",
  "Dhamrai",
  "Aminbazar",
  "Baipayl",
  "Nabinagar",
  "EPZ",
  "DEPZ",
  "Jahangirnagar",
  "Uttara",
  "Mirpur",
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Mohammadpur",
  "Badda",
  "Tejgaon",
  "Motijheel",
];

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">{kicker}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-ink-2">{text}</p>}
    </div>
  );
}

function RateCalculator({ rates }: { rates?: { uttara: number; dhakaCity: number; gazipurCity: number; narayanganjCity: number; extraPerKg: number; extraPerKgOutside: number; codPercent: number; codPercentOutside: number } | null }) {
  const [zone, setZone] = useState<"uttara" | "dhaka_city" | "gazipur_city" | "narayanganj_city">("dhaka_city");
  const [weight, setWeight] = useState(1);
  const [cod, setCod] = useState(1000);

  const baseRate = rates
    ? zone === "uttara"
      ? rates.uttara
      : zone === "dhaka_city"
        ? rates.dhakaCity
        : zone === "gazipur_city"
          ? rates.gazipurCity
          : rates.narayanganjCity
    : zone === "uttara"
      ? 60
      : zone === "dhaka_city"
        ? 70
        : 100;

  const isOutside = zone === "gazipur_city" || zone === "narayanganj_city";
  const extraKg = Math.max(0, Math.ceil(weight - 1));
  const extraRate = rates ? (isOutside ? rates.extraPerKgOutside : rates.extraPerKg) : (isOutside ? 25 : 20);
  const weightCharge = extraKg * extraRate;

  const codPct = rates ? (isOutside ? rates.codPercentOutside : rates.codPercent) : (isOutside ? 1 : 0);
  const codCharge = Math.round((cod * codPct) / 100);
  const totalCost = baseRate + weightCharge + codCharge;
  const merchantReceives = Math.max(0, cod - totalCost);

  return (
    <Card className="mx-auto mt-12 max-w-4xl overflow-hidden border-brand/20 shadow-xl">
      <div className="sunrise flex items-center justify-between px-6 py-4 text-white">
        <div className="flex items-center gap-2.5">
          <Calculator className="size-5 text-sun" />
          <h3 className="font-extrabold tracking-tight sm:text-lg">{t("Delivery Rate Calculator")}</h3>
        </div>
        <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sun sm:block">
          {t("Current rates")}
        </span>
      </div>
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-3">
              {t("Delivery Area / Zone")}
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { id: "uttara" as const, name: "Uttara", time: t("Within 3 hours") },
                { id: "dhaka_city" as const, name: "Dhaka City", time: t("Same day") },
                { id: "gazipur_city" as const, name: "Gazipur City", time: t("Same day") },
                { id: "narayanganj_city" as const, name: "Narayanganj", time: t("Same day") },
              ].map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setZone(z.id)}
                  className={cx(
                    "flex flex-col items-start rounded-xl p-3 text-left transition-all duration-150",
                    zone === z.id
                      ? "border-2 border-brand bg-brand-50/70 text-ink shadow-sm"
                      : "border border-line bg-surface text-ink-2 hover:border-navy-100 hover:bg-page",
                  )}
                >
                  <span className="text-sm font-bold text-ink">{z.name}</span>
                  <span className="text-[11px] text-ink-3">{z.time}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-3">
                {t("Parcel Weight (kg)")}
              </label>
              <span className="text-xs font-bold text-brand">{weight} {t("kg")}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {[1, 2, 3, 5].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className={cx(
                    "flex-1 rounded-xl py-2 text-xs font-bold transition",
                    weight === w ? "bg-navy-900 text-white shadow-sm" : "border border-line bg-surface text-ink-2 hover:bg-page",
                  )}
                >
                  {w} {t("kg")}
                </button>
              ))}
              <div className="w-24">
                <Input
                  type="number"
                  min={0.5}
                  max={50}
                  step={0.5}
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0.5, Number(e.target.value) || 1))}
                  className="h-9 px-2 text-center text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-3">
                {t("Cash on Delivery (COD) Amount")}
              </label>
              <span className="text-xs font-bold text-brand">{tk(cod)}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {[0, 500, 1500, 3000].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCod(c)}
                  className={cx(
                    "flex-1 rounded-xl py-2 text-xs font-bold transition",
                    cod === c ? "bg-navy-900 text-white shadow-sm" : "border border-line bg-surface text-ink-2 hover:bg-page",
                  )}
                >
                  {tk(c)}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <Input
                type="number"
                min={0}
                step={50}
                value={cod || ""}
                onChange={(e) => setCod(Math.max(0, Number(e.target.value) || 0))}
                placeholder={t("Custom COD amount (৳)")}
                className="h-10 text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Calculation Summary Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-page/70 p-5">
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-ink-3">{t("Cost Breakdown")}</p>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-ink-2">
                <span>{t("Base delivery charge")} (1 kg)</span>
                <span className="font-semibold text-ink">{tk(baseRate)}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>{t("Extra weight charge")} ({extraKg} kg)</span>
                <span className="font-semibold text-ink">{extraKg > 0 ? `+ ${tk(weightCharge)}` : "—"}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>{t("COD fee")} ({codPct}%)</span>
                <span className="font-semibold text-ink">{codCharge > 0 ? `+ ${tk(codCharge)}` : t("Free")}</span>
              </div>
              <div className="border-t border-line pt-2.5">
                <div className="flex justify-between font-bold text-ink">
                  <span>{t("Total delivery charge")}</span>
                  <span className="text-base font-extrabold text-brand">{tk(totalCost)}</span>
                </div>
              </div>
            </div>

            {cod > 0 && (
              <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <p className="text-xs font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-400">{t("Merchant will receive")}</p>
                <p className="mt-1 text-2xl font-black">{tk(merchantReceives)}</p>
                <p className="mt-0.5 text-xs opacity-80">{t("Paid to your bKash, Nagad or Bank")}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button size="lg" className="w-full" onClick={() => navigate("/register")}>
              {t("Start shipping")} <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    {
      q: t("How fast does GOEX deliver?"),
      a: t("Within Uttara, we deliver within 3 hours for orders booked between 6 AM and 12 noon. Across Dhaka City, Gazipur City and Narayanganj City, same-day delivery is available 7 days a week, starting at 6 AM."),
    },
    {
      q: t("When and how do merchants receive COD payouts?"),
      a: t("Collected cash is settled directly to your bKash, Nagad, Rocket or Bank account. You receive itemized payment statements with downloadable and printable invoices."),
    },
    {
      q: t("Can I send frozen meat, fish, cakes or perishable food?"),
      a: t("Yes! GOEX offers specialized cold-chain delivery within 6 hours across Dhaka and Savar. We keep frozen items and delicate bakery products safe, flat, and at the right temperature."),
    },
    {
      q: t("Is there any upfront fee or registration charge?"),
      a: t("No. Merchant registration is 100% free with no hidden charges. You only pay standard delivery charges when you ship parcels."),
    },
    {
      q: t("What happens if a customer refuses or returns a parcel?"),
      a: t("If a delivery cannot be completed, our rider contacts you first. For returned parcels, only a fair return charge applies, as shown in the pricing section, with 0% COD fee."),
    },
    {
      q: t("How do I book parcels?"),
      a: t("You can create parcels one-by-one in your merchant panel, upload up to 200 parcels in bulk via Excel/CSV, or message our office on WhatsApp."),
    },
  ];

  return (
    <section className="border-t border-line bg-surface py-20">
      <div className="mx-auto max-w-4xl px-5">
        <SectionTitle
          kicker={t("Got questions?")}
          title={t("Frequently Asked Questions")}
          text={t("Everything you need to know about shipping with GOEX Fast Delivery.")}
        />
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className="overflow-hidden rounded-2xl border border-line bg-page/50 transition-colors duration-150 hover:border-brand/30"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-ink"
              >
                <span className="text-base sm:text-lg">{f.q}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-ink-3">
                  {open === i ? <ChevronUp className="size-4 text-brand" /> : <ChevronDown className="size-4" />}
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-ink-2">
                  <p className="border-t border-line/60 pt-3">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const DEFAULT_PUBLIC_RATES = {
  uttara: 60,
  dhakaCity: 70,
  gazipurCity: 90,
  narayanganjCity: 110,
  extraPerKg: 15,
  extraPerKgOutside: 20,
  codPercent: 0,
  codPercentOutside: 1,
  returnPercent: 50,
};

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo size={42} />
              <Wordmark />
            </div>
            <p className="text-sm text-ink-2 leading-relaxed">
              {t("Fast, reliable and daily essential express delivery service across Dhaka and Savar. Safe door-to-door transit you can count on.")}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 ring-1 ring-brand/20">
              <MapPin className="size-3.5 text-brand" />
              <span>Dhaka & Savar, Bangladesh</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-ink uppercase">{t("Quick Links")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              <li>
                <a href="/#services" className="transition hover:text-brand">{t("Services")}</a>
              </li>
              <li>
                <a href="/#pricing" className="transition hover:text-brand">{t("Pricing")}</a>
              </li>
              <li>
                <Link href="/join" className="transition hover:text-brand">{t("Join as rider")}</Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-brand">{t("Merchant login")}</Link>
              </li>
              <li>
                <Link href="/rider" className="transition hover:text-brand">{t("Rider login")}</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Coverage */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-ink uppercase">{t("Coverage Zones")}</h4>
            <p className="mt-3 text-sm text-ink-2 leading-relaxed">
              {t("Express delivery active across Savar Sadar, Ashulia, Hemayetpur, Dhamrai, Baipayl, Aminbazar, and all major Dhaka metropolitan areas.")}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-navy-50 dark:bg-navy-900/60 px-2 py-0.5 text-xs font-medium text-ink-2">Savar</span>
              <span className="rounded-lg bg-navy-50 dark:bg-navy-900/60 px-2 py-0.5 text-xs font-medium text-ink-2">Hemayetpur</span>
              <span className="rounded-lg bg-navy-50 dark:bg-navy-900/60 px-2 py-0.5 text-xs font-medium text-ink-2">Ashulia</span>
              <span className="rounded-lg bg-navy-50 dark:bg-navy-900/60 px-2 py-0.5 text-xs font-medium text-ink-2">Dhamrai</span>
              <span className="rounded-lg bg-navy-50 dark:bg-navy-900/60 px-2 py-0.5 text-xs font-medium text-ink-2">Dhaka City</span>
            </div>
          </div>

          {/* Col 4: Contact & Social */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-ink uppercase">{t("Contact Us")}</h4>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-2">
              <li>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="flex items-center gap-2 font-bold text-brand transition hover:underline"
                  title={`Hotline: ${CONTACT.phoneDisplay}`}
                >
                  <Phone className="size-4 shrink-0" />
                  <span>01348-756651</span>
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-medium hover:text-emerald-600 transition"
                >
                  <MessageCircle className="size-4 shrink-0 text-emerald-500" />
                  <span>WhatsApp: 01348-756651</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-2 hover:text-brand transition"
                >
                  <Mail className="size-4 shrink-0 text-brand" />
                  <span>{CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={CONTACT.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-600 transition"
                >
                  <ThumbsUp className="size-4 shrink-0 text-blue-600" />
                  <span>Facebook Page</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-xs text-ink-3 pt-1">
                <MapPin className="size-4 shrink-0 text-brand mt-0.5" />
                <span>{CONTACT.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-3">
          <p>© 2026 GOEX Fast Delivery & Courier Service. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dhaka & Savar, Bangladesh</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Home() {
  const rates = DEFAULT_PUBLIC_RATES;
  const [quickBookingOpen, setQuickBookingOpen] = useState(false);
  const [initialService, setInitialService] = useState<string | undefined>(undefined);

  const openQuickOrder = (serviceName?: string) => {
    setInitialService(serviceName);
    setQuickBookingOpen(true);
  };

  return (
    <div className="min-h-full bg-page">
      {/* ---------------- hero */}
      <section className="sunrise relative overflow-hidden pb-28">
        <PublicNav onOpenQuickBooking={() => openQuickOrder()} />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pt-8 lg:grid-cols-[1.15fr_1fr] lg:pt-14">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-sun ring-1 ring-white/15">
              <Zap className="size-3.5 text-brand" /> {t("Dhaka & Savar Express Zones")}
            </span>
            {/* The brand is the headline */}
            <h1 className="keep-tracking mt-5 text-5xl font-black italic leading-[1.02] tracking-tight text-white sm:text-7xl">
              GO<span className="text-[#c084fc]">EX</span> <span className="text-white/95">FAST DELIVERY</span>
            </h1>
            <p className="mt-3 text-xl font-bold tracking-tight text-white/95 sm:text-2xl lg:text-3xl">
              {t("One stop solution for your daily lifestyle & parcel delivery")}
            </p>
            <p className="mt-4 max-w-xl text-[16px] sm:text-[17px] leading-relaxed text-white/80">
              {t(
                "Superfast delivery across Savar & Dhaka — Corporate & home lunch, 100% farm fresh pure cow milk, bachelor mess food, groceries, and parcels.",
              )}
            </p>

            {/* Quick Action CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Button
                size="lg"
                className="bg-brand hover:bg-brand-600 text-white shadow-lg shadow-brand/35 text-sm sm:text-base font-bold"
                onClick={() => openQuickOrder()}
              >
                <Sparkles className="size-4" /> {t("Quick Booking")}
              </Button>

              <a
                href={`tel:${CONTACT.phone}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 sm:px-5 py-2 text-sm sm:text-[15px] font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-[0.98]"
              >
                <Phone className="size-4 text-sun" />
                <span>{t("Call")} {CONTACT.phoneDisplay || CONTACT.phone}</span>
              </a>

              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 sm:px-5 py-2 text-sm sm:text-[15px] font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:bg-[#20ba5a] active:scale-[0.98]"
              >
                <MessageCircle className="size-4" />
                <span>{t("Order on WhatsApp")}</span>
              </a>

              <a
                href="/#join"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 sm:px-5 py-2 text-sm sm:text-[15px] font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
              >
                <Bike className="size-4 text-brand" />
                <span>{t("Join as rider")}</span>
              </a>

              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/15"
                onClick={() => navigate("/register")}
              >
                {t("Become a merchant")} <ArrowRight className="size-4" />
              </Button>
            </div>

            <div className="mt-6 max-w-xl">
              <TrackBox big />
            </div>
          </div>
          <div className="relative mx-auto hidden w-full max-w-md lg:block">
            <div className="absolute -inset-10 rounded-full bg-sun/25 blur-3xl" />
            <img src="/brand/logo.svg" alt="GOEX Fast Delivery" className="relative w-full rounded-3xl shadow-2xl ring-8 ring-white/10" />
          </div>
        </div>

        {/* quick facts */}
        <div className="relative z-10 mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-3 px-5 lg:grid-cols-4">
          {[
            { icon: Zap, title: t("Savar & Dhaka"), text: t("Complete express coverage") },
            { icon: Milk, title: t("100% Pure Cow Milk"), text: t("Direct dairy farm fresh") },
            { icon: Utensils, title: t("Home Lunch & Meals"), text: t("Hot delivery to office desk") },
            { icon: Clock, title: t("24/7 Delivery Operations"), text: CONTACT.phoneDisplay || CONTACT.phone },
          ].map((f) => (
            <div key={f.title} className="glass flex items-center gap-3 rounded-2xl p-4 transition-all duration-200 hover:bg-white/[0.1]">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
                <f.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white">{f.title}</p>
                <p className="text-xs leading-snug text-white/60">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="speed-lines absolute bottom-10 left-0 w-1/2 opacity-60" />
      </section>

      {/* ---------------- delivery speeds */}
      <section className="mx-auto -mt-14 grid max-w-6xl gap-4 px-5 md:grid-cols-3">
        {[
          {
            icon: Zap,
            badge: t("Express"),
            title: t("Same-city express delivery"),
            text: t("Inside Dhaka or inside Savar — your parcel is picked up and delivered fast, the same day."),
            accent: "bg-brand text-white",
          },
          {
            icon: Snowflake,
            badge: t("Cold chain"),
            title: t("Fish, meat, frozen & cake — express"),
            text: t("Perishable items like fish, meat, frozen food, ice cream and cakes delivered extra fast within the same city, kept cold and safe."),
            accent: "bg-sky-500 text-white",
          },
          {
            icon: Truck,
            badge: t("Same day"),
            title: t("Savar & Dhaka"),
            text: t("Regular parcels delivered the same day inside the city corporations."),
            accent: "bg-navy-900 text-white",
          },
        ].map((c) => (
          <Card key={c.title} className="relative z-10 p-6">
            <div className="flex items-center justify-between">
              <div className={cx("grid size-12 place-items-center rounded-2xl", c.accent)}>
                <c.icon className="size-6" />
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{c.badge}</span>
            </div>
            <p className="mt-5 text-lg font-extrabold tracking-tight">{c.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{c.text}</p>
          </Card>
        ))}
      </section>

      {/* ---------------- live delivery flow banner */}
      <section className="relative w-full overflow-hidden bg-[#101824] pt-8 border-y border-white/10 shadow-2xl">
        <div className="mx-auto max-w-6xl px-5 mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sun ring-1 ring-white/15">
            <span className="size-2 rounded-full bg-brand animate-ping" />
            <span>{t("Live Delivery Flow")}</span>
          </div>
          <p className="text-xs text-white/50 hidden sm:block">
            {t("Day & Night Non-Stop Express Dispatch • Savar & Dhaka")}
          </p>
        </div>
        <RoadBandAnimation />
      </section>

      {/* ---------------- services */}
      <section id="services" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-20">
        <GoexServices
          onOrder={(item) => {
            openQuickOrder(item.titleKey);
          }}
        />

        <div className="mt-20 border-t border-line pt-14">
          <SectionTitle
            kicker={t("Delivery categories")}
            title={t("We deliver all kinds of products")}
            text={t("Your product, our responsibility — from a single document to your whole shop's orders.")}
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SERVICES.map((c) => (
              <Card
                key={c}
                onClick={() => openQuickOrder(CATEGORY[c].label)}
                className="group cursor-pointer p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:ring-2 hover:ring-brand/40"
              >
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-3xl transition-transform duration-200 group-hover:scale-110">
                  {CATEGORY[c].emoji}
                </div>
                <p className="mt-3 text-sm font-bold leading-snug">{CATEGORY[c].label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- frozen spotlight */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-[#1f0f36] p-8 text-white sm:p-10">
          <Snowflake className="absolute -right-6 -top-6 size-48 text-white/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                <Snowflake className="size-3.5" /> {t("Frozen & bakery delivery")}
              </span>
              <h3 className="mt-4 text-3xl font-extrabold tracking-tight">{t("Fresh, safe and on time")}</h3>
              <p className="mt-3 max-w-lg text-white/80">
                {t(
                  "Frozen meat, chicken, fish, prawns, vegetables, snacks, ice cream, ready food, cakes and bakery items — kept at the right temperature until they reach your door.",
                )}
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                t("Carried at the right temperature"),
                t("Cold chain kept unbroken"),
                t("On-time delivery"),
                t("Clean, secure packaging"),
              ].map((x) => (
                <li key={x} className="flex items-center gap-2.5 rounded-2xl bg-white/10 p-3.5 text-sm font-semibold ring-1 ring-white/15">
                  <CheckCircle2 className="size-5 shrink-0 text-sun" /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- pricing */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-20">
        <SectionTitle kicker={t("Pricing")} title={t("Simple, honest pricing")} text={t("Up to 1 kg. No hidden charges.")} />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { zone: "uttara" as const, value: rates?.uttara, time: t("Within 3 hours"), hot: true },
            { zone: "dhaka_city" as const, value: rates?.dhakaCity, time: t("Same day") },
            { zone: "gazipur_city" as const, value: rates?.gazipurCity, time: t("Same day") },
            { zone: "narayanganj_city" as const, value: rates?.narayanganjCity, time: t("Same day") },
          ].map((r) => (
            <Card key={r.zone} className={cx("relative p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md", r.hot && "ring-2 ring-brand")}>
              {r.hot && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-white shadow-sm shadow-brand/30">
                  {t("Express")}
                </span>
              )}
              <p className="text-sm font-semibold text-ink-2">{ZONE[r.zone]}</p>
              <p className="mt-3 text-4xl font-extrabold tracking-tight text-navy-900 dark:text-white">
                {r.value === undefined ? "—" : tk(r.value)}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink-3">
                <Clock className="size-3.5" /> {r.time}
              </p>
            </Card>
          ))}
        </div>
        {rates && (
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
            {[
              {
                title: t("Each extra kg"),
                text: t("{inside} in Dhaka · {outside} in Gazipur & Narayanganj", { inside: tk(rates.extraPerKg), outside: tk(rates.extraPerKgOutside) }),
              },
              {
                title: t("COD charge"),
                text:
                  rates.codPercent === 0
                    ? t("Free inside Dhaka · {pct}% in Gazipur & Narayanganj", { pct: rates.codPercentOutside })
                    : t("{inside}% in Dhaka · {outside}% in Gazipur & Narayanganj", { inside: rates.codPercent, outside: rates.codPercentOutside }),
              },
              { title: t("Return"), text: t("{pct}% of the delivery charge", { pct: rates.returnPercent }) },
            ].map((x) => (
              <div key={x.title} className="rounded-2xl bg-surface p-4 text-center ring-1 ring-line">
                <p className="font-bold">{x.title}</p>
                <p className="mt-1 text-ink-3">{x.text}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mx-auto mt-10 max-w-4xl">
          <RateCalculator rates={rates} />
        </div>
      </section>

      {/* ---------------- how it works + coverage */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionTitle kicker={t("How it works")} title={t("From your shop to your customer")} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: PackageCheck, title: t("Book the parcel"), text: t("Create it in your merchant panel or send it on WhatsApp.") },
              { icon: Bike, title: t("We pick it up"), text: t("Our rider collects it from your shop.") },
              { icon: Truck, title: t("We deliver"), text: t("Fast, safe delivery with live status at every step.") },
              { icon: Wallet, title: t("You get paid"), text: t("Collected cash is paid to your bKash, Nagad or bank.") },
            ].map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-line p-6">
                <span className="absolute right-5 top-5 text-4xl font-extrabold text-navy-50 dark:text-white/5">{num(i + 1)}</span>
                <div className="grid size-11 place-items-center rounded-xl bg-[#1f0f36] text-sun">
                  <s.icon className="size-5" />
                </div>
                <p className="mt-4 font-bold">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-3xl bg-page p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">{t("Delivery areas")}</p>
                <h3 className="mt-1 text-2xl font-extrabold tracking-tight">{t("Savar & Dhaka, all zones")}</h3>
              </div>
            </div>

            {/* Nationwide fast live network map */}
            <div className="mt-8">
              <NetworkMapAnimation />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {COVERAGE.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-2 text-sm font-semibold ring-1 ring-line">
                  <MapPin className="size-3.5 text-brand" /> {t(a)}
                </span>
              ))}
              <span className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink-3">{t("and many more areas")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- join as rider */}
      <section id="join" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-20">
        <div className="grid overflow-hidden rounded-3xl shadow-[var(--shadow-card)] lg:grid-cols-2">
          <div className="sunrise p-8 text-white sm:p-10">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sun ring-1 ring-white/15">
              {t("GoEx টিম-এ যোগ দিন!")} · {t("Rider Recruitment")}
            </span>
            <h3 className="mt-4 text-3xl font-extrabold italic tracking-tight">
              {t("GoEx টিম-এ যোগ দিন! ঢাকায় ডেলিভারি রাইডার নিয়োগ চলছে! 🛵💼")}
            </h3>
            <p className="mt-3 text-white/80 leading-relaxed text-sm sm:text-base">
              {t("আপনার কি নিজস্ব বাইক বা সাইকেল আছে? ঢাকার রাস্তায় রাইডিং করে প্রতিদিন নিশ্চিত আয় করতে চান? তাহলে আজই যোগ দিন আমাদের GoEx Fast Delivery পরিবারে!")}
            </p>
            <p className="mt-6 text-sm font-bold text-sun uppercase tracking-wider">{t("আমাদের বিশেষ সুবিধাসমূহ:")}</p>
            <ul className="mt-2.5 space-y-2.5 text-sm">
              {[
                t("আকর্ষণীয় ফিক্সড বেতন + প্রতি ডেলিভারিতে চমৎকার কমিশন ও ইনসেন্টিভ।"),
                t("সাভার ও ঢাকার বিভিন্ন জোনে কাজ করার সুবিধা।"),
                t("ফুল-টাইম বা পার্ট-টাইম কাজ করার ফ্লেক্সিবল সুযোগ।"),
                t("প্রতিদিনের নিশ্চিত আয় ও সময়মতো পেমেন্ট সুবিধা।"),
                t("পারফরম্যান্স বোনাস ও সম্মানজনক কাজের পরিবেশ।"),
              ].map((x) => (
                <li key={x} className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 shrink-0 text-sun mt-0.5" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <p className="font-bold text-ink">{t("প্রয়োজনীয় যোগ্যতা ও ডকুমেন্টস:")}</p>
              <ul className="mt-3 space-y-2.5 text-sm text-ink-2">
                {[
                  t("নিজস্ব মোটরবাইক অথবা সাইকেল (ভালো অবস্থায়)"),
                  t("স্মার্টফোন ও সচল ইন্টারনেট সংযোগ"),
                  t("জাতীয় পরিচয়পত্র (NID)"),
                  t("বৈধ ড্রাইভিং লাইসেন্স (মোটরবাইক চালকদের জন্য)"),
                  t("ঢাকা ও সাভারের এলাকা সম্পর্কে সুস্পষ্ট ধারণা"),
                  t("সৎ, দায়িত্বশীল ও পরিশ্রমী মানসিকতা"),
                ].map((x) => (
                  <li key={x} className="flex items-center gap-2.5">
                    <ShieldCheck className="size-4 shrink-0 text-brand" /> {x}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl bg-brand-50/70 p-4 border border-brand/20">
                <p className="text-xs font-bold text-brand uppercase tracking-wider">{t("তাত্ক্ষণিক অনুসন্ধানের জন্য হেল্পলাইন:")}</p>
                <p className="mt-1 text-xs text-ink-2">
                  {t("সরাসরি কল বা WhatsApp করুন {phone} নম্বরে অথবা অনলাইনে এখনই আবেদন করুন।", { phone: CONTACT.phoneDisplay })}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => navigate("/join")}>
                {t("Apply now")} <ArrowRight className="size-4" />
              </Button>
              <a
                href={`tel:${CONTACT.phone}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm font-bold text-ink shadow-sm ring-1 ring-line hover:bg-page transition"
              >
                <Phone className="size-4 text-brand" /> {CONTACT.phoneDisplay}
              </a>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- faq */}
      <FaqSection />

      {/* ---------------- contact */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Card className="grid gap-6 p-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 px-3 py-1 text-xs font-bold text-brand ring-1 ring-brand/20">
              <MapPin className="size-3" />
              <span>Dhaka & Savar, Bangladesh</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">{t("Ready to send your parcel?")}</h3>
            <p className="mt-2 text-ink-2">{t("Call or WhatsApp us — we'll pick up your product and deliver it safely.")}</p>
            <p className="mt-4 flex items-start gap-2 text-sm text-ink-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" /> {t("Office")}: {t(CONTACT.address)}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-ink-2">
              <Mail className="size-4 shrink-0 text-brand" /> {t("Email")}:{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-brand font-medium hover:underline">
                {CONTACT.email}
              </a>
            </p>
          </div>
          <div className="grid gap-3">
            <Button
              size="lg"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-brand-600 p-4 font-bold text-white shadow-md shadow-brand/25 transition hover:brightness-105 hover:scale-[1.01]"
              onClick={() => openQuickOrder()}
            >
              <Sparkles className="size-5" /> {t("Quick Booking")}
            </Button>
            <a
              href={`tel:${CONTACT.phone}`}
              className="flex items-center gap-3 rounded-2xl bg-navy-900 dark:bg-surface border border-line p-4 font-bold text-white dark:text-ink shadow-sm transition hover:bg-navy-800 dark:hover:bg-page hover:scale-[1.01]"
            >
              <Phone className="size-5 text-sun" /> {t("Call")} {CONTACT.phoneDisplay}
            </a>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-emerald-600 p-4 font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700 hover:scale-[1.01]"
            >
              <MessageCircle className="size-5" /> WhatsApp {CONTACT.phoneDisplay}
            </a>
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-[#1f0f36] p-4 font-bold text-white ring-1 ring-white/10 hover:bg-[#2c1650] transition hover:scale-[1.01]"
            >
              <ThumbsUp className="size-5 text-brand" /> {t("Facebook page")}
            </a>
          </div>
        </Card>
      </section>

      <PublicFooter />

      <QuickServiceModal
        open={quickBookingOpen}
        onClose={() => setQuickBookingOpen(false)}
        initialService={initialService}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- auth */

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="sunrise relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Logo size={46} className="ring-2 ring-white/25" />
          <Wordmark dark />
        </Link>
        <div className="relative">
          <img src="/brand/logo.svg" alt="GOEX Fast Delivery" className="mx-auto w-80 rounded-3xl shadow-2xl ring-8 ring-white/10" />
        </div>
        <p className="text-lg font-semibold italic text-white/80">
          {t("Fast")} <span className="text-brand">•</span> {t("Safe")} <span className="text-brand">•</span> {t("On time")}
        </p>
      </div>
      <div className="relative flex items-center justify-center p-6">
        <Prefs className="absolute right-5 top-5" />
        <div className="animate-rise w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo size={44} />
            <Wordmark />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-ink-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * One sign-in form, three doors: merchants on /login, riders on /rider and
 * the admin passcode on the admin website. Each calls its own endpoint, and
 * the server refuses any account that is not that door's role.
 */
function SignIn({ door }: { door: "merchant" | "rider" | "admin" }) {
  const login = useMutation(api.auth.login);
  const riderLogin = useMutation(api.auth.riderLogin);
  const adminLogin = useMutation(api.auth.adminLogin);
  const setupInitialAdmin = useMutation(api.auth.setupInitialAdmin);
  const isSetupNeeded = useQuery(api.auth.isInitialSetupNeeded);
  const { signIn } = useSession();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState("");
  const [wrongDoor, setWrongDoor] = useState<"rider" | "merchant" | null>(null);
  const [busy, setBusy] = useState(false);

  const showSetup = door === "admin" && (isSetupNeeded === true || needsSetup);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setWrongDoor(null);
    try {
      if (showSetup) {
        if (password.length < 6) {
          setError(t("Passcode must be at least 6 characters."));
          setBusy(false);
          return;
        }
        if (password !== confirmPassword) {
          setError(t("Passcodes do not match."));
          setBusy(false);
          return;
        }
        const r = await setupInitialAdmin({ passcode: password });
        signIn(r.token, r.expiresAt);
        navigate(safeNext(nextParam()), { replace: true });
        return;
      }

      const r =
        door === "admin"
          ? await adminLogin({ passcode: password })
          : door === "rider"
            ? await riderLogin({ phone, password })
            : await login({ phone, password });
      if (r.ok) {
        signIn(r.token, r.expiresAt);
        navigate(safeNext(nextParam()), { replace: true });
      } else {
        setError(translateServer(r.error));
        if ("needsSetup" in r && r.needsSetup) {
          setNeedsSetup(true);
        }
        if ("wrongDoor" in r && r.wrongDoor) setWrongDoor(r.wrongDoor);
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const copy = {
    merchant: { title: t("Merchant login"), subtitle: t("Sign in to send and track your parcels.") },
    rider: { title: t("Rider login"), subtitle: t("For GoEx Fast Delivery staff only.") },
    admin: showSetup
      ? { title: t("Initial Admin Setup"), subtitle: t("Set up your master admin passcode to initialize the panel.") }
      : { title: t("Admin panel"), subtitle: t("Restricted area. Authorized GOEX staff only.") },
  }[door];

  return (
    <AuthLayout title={copy.title} subtitle={copy.subtitle}>
      {door === "rider" && (
        <div className="-mt-2 mb-6 flex items-center gap-3 rounded-2xl bg-brand-50 p-3.5 text-sm font-semibold text-brand-700">
          <Bike className="size-5 shrink-0" /> {t("Riders get their account from the GoEx office.")}
        </div>
      )}

      {showSetup && (
        <div className="-mt-2 mb-6 flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 p-4 text-sm text-amber-800 dark:text-amber-200">
          <ShieldCheck className="size-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold">{t("Database initialization")}</p>
            <p className="mt-0.5 text-xs opacity-90">
              {t("No admin account was found in the database. Choose a secure master passcode (minimum 6 digits or characters) to set up your admin access.")}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {door !== "admin" && (
          <Field label={t("Phone number")}>
            {(id) => (
              <Input id={id} type="tel" inputMode="tel" autoComplete="username" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            )}
          </Field>
        )}
        <Field label={door === "admin" ? (showSetup ? t("Set Admin Passcode") : t("Admin passcode")) : t("Password")}>
          {(id) => (
            <PasswordInput
              id={id}
              inputMode={door === "admin" ? "numeric" : undefined}
              autoComplete={showSetup ? "new-password" : "current-password"}
              autoFocus={door === "admin"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={showSetup ? t("Master passcode (min 6 characters)") : undefined}
              required
            />
          )}
        </Field>
        {showSetup && (
          <Field label={t("Confirm passcode")}>
            {(id) => (
              <PasswordInput
                id={id}
                inputMode="numeric"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("Confirm master passcode")}
                required
              />
            )}
          </Field>
        )}
        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        {wrongDoor && door === "merchant" && wrongDoor === "rider" && (
          <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-800">
            {t("This phone number is registered as a delivery rider. Please log in through the rider application.")}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          loading={busy}
          variant={door === "rider" ? "dark" : "primary"}
          className="w-full"
        >
          {showSetup ? t("Set Admin Passcode & Sign In") : t("Sign in")}
        </Button>
      </form>

      {door === "merchant" && (
        <>
          <p className="mt-6 text-center text-sm text-ink-2">
            {t("New merchant?")}{" "}
            <Link href="/register" className="font-semibold text-brand hover:underline">
              {t("Create an account")}
            </Link>
          </p>
          <p className="mt-3 text-center text-sm">
            <Link href="/forgot" className="font-semibold text-brand hover:underline">
              {t("Forgot password?")}
            </Link>
          </p>
        </>
      )}
      {door === "rider" && (
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-50/70 via-surface to-brand-50/30 p-4 text-xs shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-brand">{t("GoEx টিম-এ যোগ দিন! ঢাকায় ডেলিভারি রাইডার নিয়োগ চলছে! 🛵💼")}</span>
            </div>
            <p className="mt-2 text-ink-2 leading-relaxed">
              {t("আকর্ষণীয় ফিক্সড বেতন + প্রতি ডেলিভারিতে চমৎকার কমিশন ও ইনসেন্টিভ। সাভার ও ঢাকার বিভিন্ন জোনে কাজ করার সুবিধা। ফুল-টাইম বা পার্ট-টাইম ফ্লেক্সিবল সুযোগ।")}
            </p>
            <p className="mt-1 font-semibold text-ink-3">
              {t("প্রয়োজনীয়তা: নিজস্ব বাইক বা সাইকেল, স্মার্টফোন এবং NID")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={`tel:${CONTACT.phone}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 font-bold text-brand ring-1 ring-line hover:bg-brand-50 transition"
              >
                <Phone className="size-3" /> {CONTACT.phoneDisplay}
              </a>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 font-bold text-white hover:bg-emerald-700 transition"
              >
                <MessageCircle className="size-3" /> WhatsApp
              </a>
              <Link
                href="/join"
                className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 font-bold text-white hover:bg-brand-600 transition ml-auto"
              >
                {t("Apply now")} <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-ink-2">
            {t("Want to work with us?")}{" "}
            <Link href="/join" className="font-semibold text-brand hover:underline">
              {t("Apply as a rider")}
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}

export function Login() {
  return <SignIn door={IS_ADMIN_PORTAL ? "admin" : "merchant"} />;
}

export function RiderLogin() {
  return <SignIn door="rider" />;
}

export function AdminLogin() {
  return <SignIn door="admin" />;
}

/**
 * Merchant forgot their password: find the account by phone or email, then
 * send one request to the office. The office sets a new password, which is
 * emailed to the address on the account.
 */
export function ForgotPassword() {
  const find = useMutation(api.support.findAccount);
  const request = useMutation(api.support.requestReset);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<
    | null
    | { found: false }
    | { found: true; name: string; phone: string; email: string | null; alreadyRequested: boolean }
  >(null);
  const [sent, setSent] = useState<null | "sent" | "already">(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function search(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFound(null);
    setSent(null);
    try {
      setFound(await find({ query: q }));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    setBusy(true);
    setError("");
    try {
      const r = await request({ query: q });
      setSent(r.alreadyRequested ? "already" : "sent");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title={t("Forgot password")} subtitle={t("Find your merchant account and ask GOEX for a new password.")}>
      <form onSubmit={search} className="space-y-4">
        <Field label={t("Phone number or email")} hint={t("The one you signed up with.")}>
          {(id) => (
            <Input
              id={id}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setFound(null);
                setSent(null);
              }}
              placeholder={t("01XXXXXXXXX or you@example.com")}
              autoComplete="username"
              required
            />
          )}
        </Field>
        <Button type="submit" size="lg" loading={busy && !found} className="w-full">
          {t("Find my account")}
        </Button>
      </form>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}

      {found && !found.found && (
        <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {t("No merchant account found with that phone number or email.")}
        </p>
      )}

      {found && found.found && (
        <div className="animate-rise mt-5 rounded-2xl border border-line bg-page p-4">
          <p className="text-xs font-semibold text-ink-3">{t("Account found")}</p>
          <p className="mt-1 text-lg font-bold">{found.name}</p>
          <p className="font-mono text-sm text-ink-2">{found.phone}</p>
          {found.email && <p className="font-mono text-sm text-ink-2">{found.email}</p>}

          {sent === "sent" ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm font-semibold text-emerald-700">
              {t("Request sent! GOEX will set a new password and email it to you.")}
            </p>
          ) : sent === "already" || found.alreadyRequested ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-3 text-sm font-semibold text-amber-800">
              {t("You've already asked. GOEX will email your new password soon. You can ask again after the office handles it.")}
            </p>
          ) : (
            <>
              <p className="mt-3 text-sm text-ink-2">
                {found.email
                  ? t("GOEX will set a new password and email it to this address.")
                  : t("This account has no email. GOEX will call you with the new password.")}
              </p>
              <Button size="lg" className="mt-4 w-full" loading={busy} onClick={send}>
                {t("Send request to GOEX")}
              </Button>
            </>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-ink-2">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          ← {t("Back to login")}
        </Link>
      </p>
    </AuthLayout>
  );
}

export function Register() {
  const register = useMutation(api.auth.registerMerchant);
  const { signIn } = useSession();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    pickupAddress: "",
    payoutMethod: "bkash" as keyof typeof PAYOUT_METHOD,
    payoutAccount: "",
    password: "",
    confirm: "",
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (f.password !== f.confirm) return;
    setBusy(true);
    setError("");
    try {
      const { confirm: _c, ...rest } = f;
      // No approval step: the account opens and the merchant is signed in.
      const session = await register(rest);
      signIn(session.token, session.expiresAt);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const mismatch = f.confirm.length > 0 && f.password !== f.confirm;
  return (
    <AuthLayout title={t("Become a merchant")} subtitle={t("Send parcels across Savar & Dhaka with GOEX.")}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label={t("Your name")}>{(id) => <Input id={id} value={f.name} onChange={set("name")} required maxLength={80} />}</Field>
        <Field label={t("Business / page name")}>
          {(id) => <Input id={id} value={f.businessName} onChange={set("businessName")} required maxLength={100} />}
        </Field>
        <Field label={t("Phone number")}>
          {(id) => <Input id={id} type="tel" placeholder="01XXXXXXXXX" value={f.phone} onChange={set("phone")} required />}
        </Field>
        <Field label={t("Email")} hint={t("Needed to get a new password if you ever forget it.")}>
          {(id) => <Input id={id} type="email" autoComplete="email" value={f.email} onChange={set("email")} required />}
        </Field>
        <Field label={t("Pickup address")} className="sm:col-span-2">
          {(id) => <Input id={id} value={f.pickupAddress} onChange={set("pickupAddress")} required maxLength={300} placeholder={t("House, road, area, city")} />}
        </Field>
        <Field label={t("Get paid by")}>
          {(id) => (
            <Select id={id} value={f.payoutMethod} onChange={set("payoutMethod")}>
              {Object.entries(PAYOUT_METHOD).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={f.payoutMethod === "bank" ? t("Bank account details") : t("Account number")}>
          {(id) => <Input id={id} value={f.payoutAccount} onChange={set("payoutAccount")} required maxLength={100} />}
        </Field>
        <Field label={t("Password")} hint={t("At least 8 characters, with a letter and a number.")}>
          {(id) => <PasswordInput id={id} autoComplete="new-password" value={f.password} onChange={set("password")} required minLength={8} />}
        </Field>
        <Field label={t("Confirm password")} hint={mismatch ? <span className="text-red-600">{t("Passwords do not match.")}</span> : undefined}>
          {(id) => <PasswordInput id={id} autoComplete="new-password" value={f.confirm} onChange={set("confirm")} required />}
        </Field>
        {error && (
          <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 sm:col-span-2">
            {error}{" "}
            {error === t("This phone number already has an account. Please log in.") ? (
              <Link href="/login" className="font-bold underline">
                {t("Log in")}
              </Link>
            ) : null}
          </p>
        )}
        <Button type="submit" size="lg" loading={busy} disabled={mismatch} className="sm:col-span-2">
          {t("Create merchant account")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-2">
        {t("Already have an account?")}{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          {t("Sign in")}
        </Link>
      </p>
    </AuthLayout>
  );
}

/* ------------------------------------------------------------ join (rider) */

/**
 * Rider job application. This never creates an account: the admin reviews
 * it, invites the person for an interview, and only creates the rider
 * account after hiring them.
 */
export function Join() {
  const apply = useMutation(api.riderApplications.apply);
  const toast = useToast();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    vehicle: "bike",
    shift: "full_time",
    hasLicense: "yes",
    note: "",
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  if (done) {
    return (
      <AuthLayout title={t("Application sent")} subtitle={t("Thank you for applying to GoEx Fast Delivery.")}>
        <Card className="p-6">
          <CheckCircle2 className="size-10 text-emerald-500" />
          <p className="mt-4 font-semibold">{t("Our team will review your application.")}</p>
          <p className="mt-1 text-sm text-ink-2">
            {t("If you are selected, we will invite you for an interview by phone or WhatsApp ({phone}). Your rider account is created after you are hired.", { phone: CONTACT.phoneDisplay })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/")}>
              {t("Back to home")}
            </Button>
            <a
              href={`tel:${CONTACT.phone}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-bold text-ink hover:bg-page transition"
            >
              <Phone className="size-4 text-brand" /> {CONTACT.phoneDisplay}
            </a>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("GoEx টিম-এ যোগ দিন! ঢাকায় ডেলিভারি রাইডার নিয়োগ চলছে! 🛵💼")}
      subtitle={t("আকর্ষণীয় ফিক্সড বেতন + প্রতি ডেলিভারিতে চমৎকার কমিশন ও ইনসেন্টিভ। সাভার ও ঢাকার বিভিন্ন জোনে কাজ করার সুবিধা।")}
    >
      <div className="mb-6 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-50/70 via-surface to-amber-50/30 p-4 text-xs shadow-sm">
        <p className="font-bold text-brand uppercase tracking-wider">{t("GoEx Rider Perks & Benefits")}</p>
        <ul className="mt-2.5 space-y-1.5 text-ink-2">
          <li className="flex items-start gap-2">
            <span className="font-bold text-brand">•</span>
            <span><strong>{t("ফিক্সড বেতন + কমিশন:")}</strong> {t("আকর্ষণীয় ফিক্সড বেতন + ডেলিভারি কমিশন ও ডেইলি ইনসেন্টিভ।")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-brand">•</span>
            <span><strong>{t("জোন সুবিধা:")}</strong> {t("ঢাকা ও সাভারের বিভিন্ন জোনে কাজ করার সুবিধা।")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-brand">•</span>
            <span><strong>{t("কাজের ধরণ:")}</strong> {t("ফুল-টাইম বা পার্ট-টাইম কাজ করার ফ্লেক্সিবল সুযোগ।")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-brand">•</span>
            <span><strong>{t("প্রয়োজনীয়তা:")}</strong> {t("নিজস্ব মোটরবাইক বা সাইকেল, স্মার্টফোন এবং NID।")}</span>
          </li>
        </ul>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/60 pt-2.5">
          <span className="text-[11px] font-semibold text-ink-3">{t("তাত্ক্ষণিক হেল্পলাইন:")}</span>
          <a href={`tel:${CONTACT.phone}`} className="inline-flex items-center gap-1 font-bold text-brand hover:underline">
            <Phone className="size-3" /> {CONTACT.phoneDisplay}
          </a>
          <span className="text-ink-3">·</span>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:underline">
            <MessageCircle className="size-3" /> WhatsApp
          </a>
        </div>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const vehicleLabel = f.vehicle === "bike" ? "Motorcycle" : f.vehicle === "bicycle" ? "Bicycle" : "No vehicle";
            const shiftLabel = f.shift === "full_time" ? "Full-time" : "Part-time";
            const combinedNote = [
              f.note ? f.note.trim() : null,
              `Vehicle: ${vehicleLabel}`,
              `Shift: ${shiftLabel}`,
            ]
              .filter(Boolean)
              .join(" | ");

            await apply({
              name: f.name,
              phone: f.phone,
              email: f.email.trim() ? f.email.trim() : undefined,
              area: f.area,
              hasBike: f.vehicle === "bike" || f.vehicle === "bicycle",
              hasLicense: f.hasLicense === "yes",
              note: combinedNote.slice(0, 300),
            });
            setDone(true);
          } catch (err) {
            toast.error(err);
          } finally {
            setBusy(false);
          }
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label={t("Full name")}>{(id) => <Input id={id} value={f.name} onChange={set("name")} required maxLength={80} />}</Field>
        <Field label={t("Phone number")}>
          {(id) => <Input id={id} type="tel" placeholder="01XXXXXXXXX" value={f.phone} onChange={set("phone")} required />}
        </Field>
        <Field label={t("Email (optional)")} hint={t("Optional — notifications can also be sent via phone / WhatsApp.")}>
          {(id) => <Input id={id} type="email" value={f.email} onChange={set("email")} maxLength={120} />}
        </Field>
        <Field label={t("Preferred Zone / Living Area")} hint={t("Dhaka (Mirpur, Uttara, Dhanmondi, etc.) or Savar")}>
          {(id) => <Input id={id} value={f.area} onChange={set("area")} required maxLength={80} placeholder={t("e.g. Dhaka or Savar")} />}
        </Field>
        <Field label={t("Vehicle Type")}>
          {(id) => (
            <Select id={id} value={f.vehicle} onChange={set("vehicle")}>
              <option value="bike">{t("Motorcycle / বাইক")}</option>
              <option value="bicycle">{t("Bicycle / সাইকেল")}</option>
              <option value="none">{t("None / কোনোটি নয়")}</option>
            </Select>
          )}
        </Field>
        <Field label={t("Work Shift")}>
          {(id) => (
            <Select id={id} value={f.shift} onChange={set("shift")}>
              <option value="full_time">{t("Full-time / ফুল-টাইম")}</option>
              <option value="part_time">{t("Part-time / পার্ট-টাইম")}</option>
            </Select>
          )}
        </Field>
        <Field label={t("Driving licence?")} className="sm:col-span-2">
          {(id) => (
            <Select id={id} value={f.hasLicense} onChange={set("hasLicense")}>
              <option value="yes">{t("Yes (for motorcycle)")}</option>
              <option value="no">{t("No / Bicycle Rider")}</option>
            </Select>
          )}
        </Field>
        <Field label={t("Anything else? (optional)")} className="sm:col-span-2">
          {(id) => <Textarea id={id} value={f.note} onChange={set("note")} maxLength={200} placeholder={t("NID status, previous delivery experience, etc.")} />}
        </Field>
        <Button type="submit" size="lg" loading={busy} className="sm:col-span-2">
          {t("Send application")}
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-ink-3">
        <span>{t("Have questions about rider recruitment?")}</span>
        <div className="flex items-center gap-3">
          <a href={`tel:${CONTACT.phone}`} className="font-bold text-brand hover:underline">
            📞 {CONTACT.phoneDisplay}
          </a>
          <span>·</span>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 hover:underline">
            💬 WhatsApp
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}

/* --------------------------------------------------------------- track */

const JOURNEY = ["pending", "picked_up", "at_hub", "out_for_delivery", "delivered"] as const;

export function Track({ code }: { code?: string }) {
  const { token, me } = useSession();
  const result = useQuery(api.track.byCode, code && token ? { token, code } : "skip");
  const [copied, setCopied] = useState(false);

  // Tracking needs an account: send signed-out visitors to log in, then back here.
  useEffect(() => {
    if (code && me === null) navigate(`/login?next=${encodeURIComponent(`/track/${code}`)}`, { replace: true });
  }, [code, me]);

  const parcel = result && "parcel" in result ? result.parcel : undefined;

  return (
    <div className="min-h-full bg-page">
      <section className="sunrise pb-16">
        <PublicNav />
        <div className="mx-auto max-w-2xl px-5 pt-8 text-center">
          <h1 className="text-3xl font-extrabold italic tracking-tight text-white sm:text-4xl">{t("Track your parcel")}</h1>
          <p className="mt-2 text-white/70">{t("Enter the tracking ID from your parcel label or SMS.")}</p>
          <div className="mt-6 text-left">
            <TrackBox />
          </div>
        </div>
      </section>
      <div className="mx-auto -mt-8 max-w-2xl px-5 pb-16">
        {!code ? null : !me ? (
          <Card className="animate-rise p-8 text-center">
            <PackageSearch className="mx-auto size-12 text-brand" />
            <h2 className="mt-4 text-xl font-bold">{t("Sign in to track your parcel")}</h2>
            <p className="mt-2 text-sm text-ink-2">
              {t("For privacy and security, parcel tracking is available after logging into your merchant or rider account.")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate(`/login?next=${encodeURIComponent(`/track/${code}`)}`)}>
                {t("Merchant login")}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate(`/rider?next=${encodeURIComponent(`/track/${code}`)}`)}>
                {t("Rider login")}
              </Button>
            </div>
          </Card>
        ) : result === undefined ? (
          <Card className="p-10 text-center text-ink-3">{t("Looking up {code}…", { code })}</Card>
        ) : !parcel ? (
          <Card className="p-10 text-center">
            <PackageSearch className="mx-auto size-10 text-ink-3" />
            <p className="mt-3 font-bold">{t("No parcel found")}</p>
            <p className="mt-1 text-sm text-ink-2">{t("You can only track parcels that belong to you or are assigned to you.")}</p>
          </Card>
        ) : (
          <Card className="animate-rise overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-ink-3">{t("TRACKING ID")}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-xl font-bold">{parcel.trackingCode}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(parcel.trackingCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink-2 shadow-xs transition hover:bg-page hover:text-ink active:scale-95"
                    title={t("Copy ID")}
                  >
                    {copied ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    <span>{copied ? t("Copied!") : t("Copy ID")}</span>
                  </button>
                </div>
              </div>
              <StatusBadge status={parcel.status} className="px-3.5 py-1.5 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-line p-6 text-sm sm:grid-cols-3">
              <div>
                <p className="text-ink-3">{t("From")}</p>
                <p className="font-semibold">{parcel.merchantName || "—"}</p>
              </div>
              <div>
                <p className="text-ink-3">{t("To")}</p>
                <p className="font-semibold">
                  {parcel.recipientName}, {parcel.area}
                </p>
                <p className="text-xs text-ink-3">{ZONE[parcel.zone]}</p>
              </div>
              <div>
                <p className="text-ink-3">{parcel.status === "delivered" ? t("Paid") : t("Amount to pay")}</p>
                <p className="font-semibold">{tk(parcel.codAmount)}</p>
                {parcel.category && (
                  <p className="text-xs text-ink-3">
                    {CATEGORY[parcel.category].emoji} {CATEGORY[parcel.category].label}
                  </p>
                )}
              </div>
            </div>
            <JourneyBar status={parcel.status} />
            <ol className="space-y-0 p-6">
              {parcel.timeline.map((e, i) => (
                <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < parcel.timeline.length - 1 && <span className="absolute left-[9px] top-6 h-full w-0.5 bg-line" />}
                  {i === 0 ? (
                    <CheckCircle2 className="relative z-10 size-5 shrink-0 text-brand" />
                  ) : (
                    <Circle className="relative z-10 size-5 shrink-0 fill-surface text-ink-3" />
                  )}
                  <div>
                    <p className={cx("font-semibold", i === 0 ? "text-ink" : "text-ink-2")}>{STATUS[e.status].label}</p>
                    <p className="text-xs text-ink-3">{dateTime(e.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}

function JourneyBar({ status }: { status: keyof typeof STATUS }) {
  const idx = JOURNEY.indexOf(status as (typeof JOURNEY)[number]);
  const step = status === "partial_delivered" ? 4 : status === "hold" ? 3 : idx;
  if (step < 0) return null;
  const labels = [t("Booked"), t("Picked"), t("Hub"), t("On the way"), t("Delivered")];
  return (
    <div className="border-b border-line px-6 py-5">
      <div className="flex items-center">
        {JOURNEY.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div
              className={cx(
                "grid size-8 place-items-center rounded-full text-xs font-bold",
                i <= step ? "bg-brand text-white" : "bg-navy-50 text-ink-3",
              )}
            >
              {num(i + 1)}
            </div>
            {i < JOURNEY.length - 1 && <div className={cx("mx-1 h-1 flex-1 rounded", i < step ? "bg-brand" : "bg-navy-50")} />}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-ink-3">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}
