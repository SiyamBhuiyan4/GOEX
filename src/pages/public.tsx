import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Headphones,
  Circle,
  Copy,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Milk,
  Package,
  PackageCheck,
  PackageSearch,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Snowflake,
  Soup,
  ThumbsUp,
  Truck,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Link, navigate } from "../lib/router";
import { useSession } from "../lib/session";
import { errorText } from "../lib/toast";
import { CATEGORY, PAYOUT_METHOD, STATUS, ZONE, dateTime, num, tk } from "../lib/format";
import { CONTACT } from "../lib/contact";
import { Button, Card, Field, Input, BrandLogo, Logo, PasswordInput, Select, StatusBadge, cx } from "../components/ui";
import { IS_ADMIN_PORTAL } from "../lib/portal";
import { Prefs } from "../components/Prefs";
import { t, translateServer } from "../lib/prefs";
import { MilkOrderModal } from "../components/MilkOrderModal";
import { ApplicationSent, RiderApplicationForm, RiderApplyModal } from "../components/RiderApplicationForm";
import { CoverageMap } from "../components/CoverageMap";
import { PricingSection } from "../components/PricingSection";

/** Only same-site paths may be used as a post-login destination. */
export function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/app";
}
const nextParam = () => new URLSearchParams(location.search).get("next");

/* ------------------------------------------------------------------ nav */

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#coverage", label: "Coverage" },
  { href: "/#join", label: "Careers" },
  { href: "/#faq", label: "FAQ" },
];

function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5">
      <Link href="/" className="flex shrink-0 items-center gap-3">
        <BrandLogo height={42} className="ring-2 ring-white/20" />
      </Link>

      <nav className="hidden items-center gap-1 lg:flex">
        {NAV.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            {t(n.label)}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Prefs onDark />
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="grid size-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
          aria-label={t("Menu")}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="animate-rise absolute inset-x-4 top-20 z-40 rounded-3xl border border-white/15 bg-navy-950/95 p-4 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                {t(n.label)}
              </a>
            ))}
            <div className="my-2 border-t border-white/10" />
            <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">
              <Phone className="size-4 text-sun" /> {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function TrackBox() {
  const [code, setCode] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const c = code.trim().toUpperCase();
        if (c) navigate(`/track/${encodeURIComponent(c)}`);
      }}
      className="flex w-full gap-2 rounded-2xl bg-surface p-2 shadow-[var(--shadow-pop)]"
    >
      <div className="flex flex-1 items-center gap-2 pl-3">
        <PackageSearch className="size-5 shrink-0 text-brand" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("Track your parcel — enter tracking ID")}
          aria-label={t("Tracking ID")}
          className="h-11 w-full min-w-0 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-3"
          maxLength={20}
        />
      </div>
      <Button type="submit" size="lg" icon={Search}>
        {t("Track")}
      </Button>
    </form>
  );
}

/* ----------------------------------------------------------------- data */

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Trusted & fast delivery" },
  { icon: Truck, label: "Home delivery service" },
  { icon: MapPin, label: "Across Savar & Dhaka" },
  { icon: Zap, label: "Express courier & logistics" },
  { icon: PackageSearch, label: "Parcel tracking" },
  { icon: Headphones, label: "24/7 customer support" },
];

const DELIVERY_SERVICES = [
  {
    id: "parcel",
    icon: Package,
    title: "Express parcel delivery",
    text: "Any parcel, anywhere in Savar & Dhaka — picked up and delivered superfast with parcel tracking.",
    points: ["Same-day delivery", "Live parcel tracking", "Cash on delivery"],
  },
  {
    id: "perishable",
    icon: Snowflake,
    title: "Fish, meat, frozen & cake",
    text: "Perishable items delivered extra fast within the same city, kept cold, flat and safe.",
    points: ["Same-city express", "Kept cold & fresh", "Careful handling for cakes"],
  },
  {
    id: "grocery",
    icon: ShoppingBasket,
    title: "Grocery from your shop",
    text: "Name your favourite local shop or superstore — we buy rice, dal, oil and all daily essentials there and bring them home.",
    points: ["From the shop you choose", "100% accurate & fresh items", "Fast, safe home delivery"],
  },
  {
    id: "lunch",
    icon: Utensils,
    title: "Home-to-office lunch",
    text: "Your home-cooked lunch, collected from your home and delivered hot to your office desk — every day.",
    points: ["Collected on your schedule", "Hot & fresh, straight to your desk", "Daily or monthly plans"],
  },
  {
    id: "meal",
    icon: Soup,
    title: "Bachelor & mess meals",
    text: "Fresh food from the best local rice hotels at affordable prices, delivered right to your room.",
    points: ["Full meals at low cost", "Best local hotel menu", "Free, on-time home delivery"],
  },
];

const STEPS = [
  { icon: PackageCheck, title: "Book", text: "Create your parcel or order from your merchant account." },
  { icon: Bike, title: "Pickup", text: "Our rider collects from the shop, hotel, home or office you name." },
  { icon: Truck, title: "Delivery", text: "Delivered fast and safe to your address." },
];

const MILK_POINTS = [
  { icon: Milk, text: "Straight from the farm" },
  { icon: ShieldCheck, text: "100% pure & fresh" },
  { icon: PackageCheck, text: "Hygienic packaging" },
  { icon: Truck, text: "Daily, on-time delivery" },
];

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Open a free merchant account and book deliveries from your panel — one by one or in bulk with a CSV. For pure farm cow milk, order directly from this page, or call or WhatsApp us at 01348-756651.",
  },
  {
    q: "Which areas do you cover?",
    a: "We deliver across Savar (Savar Sadar, Ashulia, Hemayetpur, Dhamrai and more) and all major areas of Dhaka city.",
  },
  {
    q: "Do you deliver fish, meat, frozen items and cakes?",
    a: "Yes. Perishable items are delivered extra fast within the same city and kept cold and safe on the way.",
  },
  {
    q: "How does the home-to-office lunch service work?",
    a: "Our rider collects your lunch box from your home at the time you choose and delivers it hot to your office desk.",
  },
  {
    q: "How do businesses send parcels and get COD payments?",
    a: "Register as a merchant for free, book parcels one by one or upload a CSV in bulk. Collected cash is paid to your bKash, Nagad or bank account.",
  },
];

/* --------------------------------------------------------------- pieces */

function SectionTitle({ kicker, title, text, light }: { kicker: string; title: string; text?: string; light?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={cx("text-xs font-bold tracking-[0.18em] uppercase", light ? "text-sun" : "text-brand")}>{kicker}</p>
      <h2 className={cx("mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl", light && "text-white")}>{title}</h2>
      {text && <p className={cx("mt-3", light ? "text-white/70" : "text-ink-2")}>{text}</p>}
    </div>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-6 border-t border-line bg-surface py-20">
      <div className="mx-auto max-w-3xl px-5">
        <SectionTitle kicker={t("FAQ")} title={t("Frequently asked questions")} />
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-line bg-page/50">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-ink"
              >
                <span>{t(f.q)}</span>
                {open === i ? <ChevronUp className="size-4 shrink-0 text-brand" /> : <ChevronDown className="size-4 shrink-0 text-ink-3" />}
              </button>
              {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-ink-2">{t(f.a)}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo height={52} className="ring-1 ring-line" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">
            {t("Your need, our responsibility. Trusted and fast delivery across Savar & Dhaka.")}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold tracking-wider text-ink uppercase">{t("Company")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition hover:text-brand">{t(n.label)}</a>
              </li>
            ))}
            <li>
              <Link href="/login" className="transition hover:text-brand">{t("Merchant login")}</Link>
            </li>
            <li>
              <Link href="/rider" className="transition hover:text-brand">{t("Rider login")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold tracking-wider text-ink uppercase">{t("Contact")}</h4>
          <ul className="mt-3 space-y-2.5 text-sm text-ink-2">
            <li>
              <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2 font-bold text-brand hover:underline">
                <Phone className="size-4 shrink-0" /> {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-brand">
                <MessageCircle className="size-4 shrink-0 text-brand" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 transition hover:text-brand">
                <Mail className="size-4 shrink-0 text-brand" /> {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-brand">
                <ThumbsUp className="size-4 shrink-0 text-brand" /> {t("Facebook page")}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-brand" /> {t("Savar & Dhaka, Bangladesh")}
            </li>
          </ul>
        </div>
      </div>
      <div className="space-y-1 border-t border-line px-5 py-5 text-center text-xs text-ink-3">
        <p>
          © {new Date().getFullYear()} GOEX Fast Delivery. {t("All rights reserved.")}
        </p>
        <p>{t("Map data © OpenStreetMap contributors · Boundaries © geoBoundaries")}</p>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------------- home */

export function Home() {
  const [orderOpen, setOrderOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div className="min-h-full bg-page">
      {/* ---------------- hero */}
      <section className="sunrise relative overflow-hidden pb-16 sm:pb-20">
        <PublicNav />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 pt-8 lg:grid-cols-[1.2fr_1fr] lg:pt-14">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-sun ring-1 ring-white/15">
              <MapPin className="size-3.5" /> {t("Savar & Dhaka")}
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl">
              {t("Your need,")} <span className="text-[#c084fc]">{t("our responsibility.")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/80 sm:text-[17px]">
              {t(
                "GoEx Fast Delivery — your trusted and fast delivery partner. Office lunch, mess meals, pure cow milk, groceries and express parcels, all under one roof.",
              )}
            </p>
            <div className="mt-7">
              <Button size="lg" onClick={() => navigate("/login")}>
                {t("Merchant login")} <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="mt-8 max-w-xl">
              <TrackBox />
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3">
            {HIGHLIGHTS.map((h, i) => (
              <li
                key={h.label}
                className="hl-tile glass flex items-center gap-3 rounded-2xl p-4"
                style={{ "--d": `${(i * 0.12 + (i % 2) * 0.35).toFixed(2)}s` } as CSSProperties}
              >
                <span className="hl-icon grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white">
                  <h.icon className="size-5" />
                </span>
                <span className="text-sm font-bold leading-snug text-white">{t(h.label)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- delivery services (booked by merchants after login) */}
      <section id="services" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          {/* Stays in view while the service list scrolls past (desktop) */}
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">{t("Delivery services")}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Fast delivery for everything you send")}</h2>
            <p className="mt-4 leading-relaxed text-ink-2">
              {t("Open a free merchant account to book, track and manage every delivery — pickup from your shop, hotel, home or office, delivered across Savar & Dhaka.")}
            </p>
            <ol className="mt-8 space-y-4">
              {STEPS.map((st, i) => (
                <li key={st.title} className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-sm font-extrabold text-white">{num(i + 1)}</span>
                  <span>
                    <span className="block font-bold">{t(st.title)}</span>
                    <span className="block text-sm text-ink-2">{t(st.text)}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate("/register")}>
                {t("Become a merchant")} <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                {t("Merchant login")}
              </Button>
            </div>
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-surface ring-1 ring-line">
            {DELIVERY_SERVICES.map((s) => (
              <li key={s.id} className="flex items-start gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
                  <s.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold">{t(s.title)}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{t(s.text)}</p>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-brand-700">
                    {s.points.map((pt) => (
                      <span key={pt} className="inline-flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> {t(pt)}
                      </span>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PricingSection />

      {/* ---------------- our own product: milk */}
      <section id="milk" className="scroll-mt-6 bg-[#1f0f36] py-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-sun uppercase">{t("Our own product")}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Pure farm cow milk")}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-white/75">
              {t("100% pure, fresh cow milk collected directly from trusted farms and delivered to your home.")}
            </p>
            <Button size="lg" className="mt-8" onClick={() => setOrderOpen(true)}>
              {t("Order milk")} <ArrowRight className="size-4" />
            </Button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {MILK_POINTS.map((m) => (
              <li key={m.text} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white">
                  <m.icon className="size-5" />
                </span>
                <span className="text-sm font-semibold">{t(m.text)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- coverage */}
      <section id="coverage" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-20">
        <SectionTitle kicker={t("Coverage")} title={t("Where we deliver")} />
        <div className="mt-10">
          <CoverageMap />
        </div>
      </section>

      {/* ---------------- careers */}
      <section id="join" className="mx-auto max-w-6xl scroll-mt-6 px-5 pb-20">
        <div className="grid overflow-hidden rounded-3xl shadow-[var(--shadow-card)] lg:grid-cols-2">
          <div className="sunrise p-8 text-white sm:p-10">
            <p className="text-xs font-bold tracking-[0.18em] text-sun uppercase">{t("Careers")}</p>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight">{t("Join the GoEx team — riders wanted")}</h3>
            <p className="mt-3 leading-relaxed text-white/80">
              {t("Have your own bike or cycle? Earn every day delivering across Savar & Dhaka with GoEx Fast Delivery.")}
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "Attractive fixed salary + commission and incentive on every delivery",
                "Full-time or part-time — flexible hours",
                "Work in different zones of Savar & Dhaka",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sun" /> {t(x)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-between bg-surface p-8 sm:p-10">
            <div>
              <p className="font-bold">{t("Requirements")}</p>
              <ul className="mt-3 space-y-2.5 text-sm text-ink-2">
                {[
                  "Own motorbike or bicycle",
                  "Smartphone with internet",
                  "Good knowledge of Dhaka / Savar roads",
                  "National ID (NID)",
                ].map((x) => (
                  <li key={x} className="flex items-center gap-2.5">
                    <ShieldCheck className="size-4 shrink-0 text-brand" /> {t(x)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setApplyOpen(true)}>
                {t("Apply now")} <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <FaqSection />

      <PublicFooter />

      <MilkOrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
      <RiderApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}

/* ---------------------------------------------------------------- auth */

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="sunrise relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <span />
        <Link href="/" className="relative mx-auto block">
          <Logo size={300} className="shadow-2xl ring-8 ring-white/10" />
        </Link>
        <p className="text-xl font-extrabold tracking-tight text-white">
          {t("Your need,")} <span className="text-[#c084fc]">{t("our responsibility.")}</span>
        </p>
      </div>
      <div className="relative flex items-center justify-center px-6 pb-10 pt-20">
        <Link href="/" className="absolute left-5 top-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 transition hover:text-brand">
          <ArrowLeft className="size-4" /> {t("Back to website")}
        </Link>
        <Prefs className="absolute right-5 top-5" />
        <div className="animate-rise w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandLogo height={48} className="ring-1 ring-line" />
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
        <div className="mt-6">
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
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <AuthLayout title={t("Application sent")} subtitle={t("Thank you for applying to GoEx Fast Delivery.")}>
        <ApplicationSent action={<Button onClick={() => navigate("/")}>{t("Back to home")}</Button>} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("Apply as a rider")} subtitle={t("Join the GoEx team in Savar & Dhaka.")}>
      <ul className="mb-6 space-y-2 rounded-2xl bg-brand-50/70 p-4 text-sm text-ink-2 ring-1 ring-brand/15">
        {[
          "Attractive fixed salary + commission and incentive on every delivery",
          "Full-time or part-time — flexible hours",
          "Work in different zones of Savar & Dhaka",
        ].map((x) => (
          <li key={x} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" /> {t(x)}
          </li>
        ))}
      </ul>
      <RiderApplicationForm onSubmitted={() => setDone(true)} />
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
