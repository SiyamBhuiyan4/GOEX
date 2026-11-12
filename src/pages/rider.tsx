import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  Banknote,
  Bike,
  Clock,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useAuthed } from "../lib/session";
import { usePendingKeys, useToast } from "../lib/toast";
import { CATEGORY, dateTime, num, tk } from "../lib/format";
import { Button, Card, Empty, PageHeader, Spinner, StatusBadge, cx } from "../components/ui";
import { StatusActions } from "../components/ParcelDetail";
import { CONTACT } from "../lib/contact";
import { t } from "../lib/prefs";

/**
 * Rider Benefits & Perks Card:
 * Displays compensation structure, zone assignments, and instant helpline/WhatsApp.
 */
export function RiderBenefitsCard({ className, defaultOpen = false }: { className?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className={cx("overflow-hidden border border-brand/20 bg-gradient-to-br from-brand-50/50 via-surface to-amber-50/30 p-5 shadow-sm", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-md shadow-brand/20">
            <Bike className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-ink">{t("GoEx Rider Perks & Benefits")}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                <Sparkles className="size-3" /> {t("Dhaka & Savar Hiring Active")}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-2">
              {t("Fixed salary + commissions · Dhaka & Savar zones · Bike/Bicycle · Helpline: {phone}", { phone: CONTACT.phoneDisplay })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${CONTACT.phone}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-600 transition"
          >
            <Phone className="size-3.5" /> {CONTACT.phoneDisplay}
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <MessageCircle className="size-3.5" /> WhatsApp
          </a>
          <Button size="sm" variant="outline" onClick={() => setOpen((prev) => !prev)}>
            {open ? t("Hide details") : t("View all perks")}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-5 border-t border-line pt-4 animate-in fade-in duration-200">
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand">
              {t("GoEx Delivery Partner Perks & Requirements")}
            </p>
            <p className="text-xs text-ink-3">
              {t("Attractive fixed salary, per-delivery commission, flexible shifts, and dedicated dispatcher support.")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-brand">
                <Banknote className="size-4 shrink-0" />
                <p className="text-xs font-bold text-ink">{t("Attractive Fixed Salary + Commissions")}</p>
              </div>
              <p className="mt-1 text-xs text-ink-2">
                {t("Guaranteed fixed salary plus attractive commissions on every delivered parcel & daily performance incentives.")}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-brand">
                <MapPin className="size-4 shrink-0" />
                <p className="text-xs font-bold text-ink">{t("Dhaka & Savar Zone Assignments")}</p>
              </div>
              <p className="mt-1 text-xs text-ink-2">
                {t("Convenient hub assignment across Dhaka Metro zones and Savar commercial express routes.")}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-brand">
                <Clock className="size-4 shrink-0" />
                <p className="text-xs font-bold text-ink">{t("Full-Time & Part-Time Flexibility")}</p>
              </div>
              <p className="mt-1 text-xs text-ink-2">
                {t("Flexible shift options suited for full-time professionals, students, or part-time riders.")}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-brand">
                <Bike className="size-4 shrink-0" />
                <p className="text-xs font-bold text-ink">{t("Bike or Bicycle Accepted")}</p>
              </div>
              <p className="mt-1 text-xs text-ink-2">
                {t("Deliver using your own motorbike or cycle — daily routes optimized for both vehicle types.")}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-brand">
                <ShieldCheck className="size-4 shrink-0" />
                <p className="text-xs font-bold text-ink">{t("Requirements: Smartphone & NID")}</p>
              </div>
              <p className="mt-1 text-xs text-ink-2">
                {t("Must have an active smartphone with internet, valid National ID (NID), and driving licence (for motorbikes).")}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <Phone className="size-4 shrink-0" />
                <p className="text-xs font-bold text-ink">{t("Direct Rider Helpline")}</p>
              </div>
              <p className="mt-1 text-xs text-ink-2">
                {t("Helpline {phone} & WhatsApp available for instant rider inquiries, route support, and dispatch help.", { phone: CONTACT.phoneDisplay })}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Full Rider Onboarding & Benefits View:
 * For public onboarding, applicant orientation, and recruitment reference.
 */
export function RiderOnboardingPerks({ className }: { className?: string }) {
  return (
    <div className={cx("space-y-6", className)}>
      <div className="sunrise rounded-3xl p-6 sm:p-8 text-white">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sun ring-1 ring-white/15">
          {t("GoEx Fast Delivery পরিবারে যোগ দিন")}
        </span>
        <h2 className="mt-3 text-2xl font-extrabold italic tracking-tight sm:text-3xl">
          {t("GoEx টিম-এ যোগ দিন! ঢাকায় ডেলিভারি রাইডার নিয়োগ চলছে! 🛵💼")}
        </h2>
        <p className="mt-2 text-sm text-white/80 leading-relaxed sm:text-base">
          {t("আপনার কি নিজস্ব বাইক বা সাইকেল আছে? ঢাকার রাস্তায় রাইডিং করে প্রতিদিন নিশ্চিত আয় করতে চান? তাহলে আজই যোগ দিন আমাদের GoEx Fast Delivery পরিবারে!")}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`tel:${CONTACT.phone}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand shadow-sm hover:bg-white/90 transition"
          >
            <Phone className="size-4" /> {t("Helpline")}: {CONTACT.phoneDisplay}
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <MessageCircle className="size-4" /> WhatsApp {CONTACT.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2.5 text-brand">
            <Banknote className="size-5" />
            <h4 className="font-bold text-ink">{t("ফিক্সড বেতন + কমিশন")}</h4>
          </div>
          <p className="mt-2 text-sm text-ink-2">
            {t("আকর্ষণীয় ফিক্সড বেতন + প্রতি ডেলিভারিতে চমৎকার কমিশন ও ইনসেন্টিভ।")}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2.5 text-brand">
            <Clock className="size-5" />
            <h4 className="font-bold text-ink">{t("ফুল-টাইম বা পার্ট-টাইম")}</h4>
          </div>
          <p className="mt-2 text-sm text-ink-2">
            {t("ফুল-টাইম বা পার্ট-টাইম কাজ করার ফ্লেক্সিবল সুযোগ।")}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2.5 text-brand">
            <MapPin className="size-5" />
            <h4 className="font-bold text-ink">{t("ঢাকা ও সাভার জোন")}</h4>
          </div>
          <p className="mt-2 text-sm text-ink-2">
            {t("সাভার ও ঢাকার বিভিন্ন জোনে কাজ করার সুবিধা।")}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2.5 text-brand">
            <Bike className="size-5" />
            <h4 className="font-bold text-ink">{t("বাইক বা সাইকেল")}</h4>
          </div>
          <p className="mt-2 text-sm text-ink-2">
            {t("নিজস্ব মোটরবাইক অথবা সাইকেল নিয়ে কাজ করার সুবিধা।")}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2.5 text-brand">
            <ShieldCheck className="size-5" />
            <h4 className="font-bold text-ink">{t("স্মার্টফোন ও NID")}</h4>
          </div>
          <p className="mt-2 text-sm text-ink-2">
            {t("নিজস্ব মোটরবাইক/সাইকেল, স্মার্টফোন এবং জাতীয় পরিচয়পত্র (NID) থাকতে হবে।")}
          </p>
        </Card>

        <Card className="p-5 bg-emerald-50/50 border-emerald-100">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <Phone className="size-5" />
            <h4 className="font-bold text-emerald-900">{t("সরাসরি হেল্পলাইন")}</h4>
          </div>
          <p className="mt-2 text-sm text-emerald-800">
            {t("তাৎক্ষণিক অনুসন্ধানের জন্য সরাসরি কল বা WhatsApp করুন: {phone}", { phone: CONTACT.phoneDisplay })}
          </p>
        </Card>
      </div>
    </div>
  );
}

export function RiderTasks() {
  const { token, me } = useAuthed();
  const toast = useToast();
  const tasks = useQuery(api.rider.tasks, { token });
  const update = useMutation(api.parcels.updateStatus);
  const [tab, setTab] = useState<"deliver" | "pickup" | "hold">("deliver");
  const pendingKeys = usePendingKeys();
  if (!tasks) return <Spinner />;

  const tabs = [
    { key: "deliver" as const, label: t("Deliver"), count: tasks.deliveries.length, icon: Truck },
    { key: "pickup" as const, label: t("Pickup"), count: tasks.pickupStops.reduce((s, x) => s + x.parcels.length, 0), icon: Store },
    { key: "hold" as const, label: t("On hold"), count: tasks.onHold.length, icon: Package },
  ];

  return (
    <>
      <PageHeader title={`${t("Hi, {name}", { name: me.name.split(" ")[0] })} 👋`} subtitle={t("Your assigned deliveries and pickups.")} />
      <Card className="sunrise mb-5 flex items-center justify-between border-0 p-5 text-white">
        <div>
          <p className="text-sm text-white/70">{t("Cash in hand")}</p>
          <p className="text-3xl font-extrabold">{tk(tasks.cashInHand)}</p>
        </div>
        <div className="text-right text-sm text-white/70">
          <Banknote className="ml-auto size-7 text-sun" />
          {t("{n} parcels", { n: tasks.cashParcels })}
        </div>
      </Card>

      <RiderBenefitsCard className="mb-5" />

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-1.5 shadow-[var(--shadow-card)]">
        {tabs.map((x) => (
          <button
            key={x.key}
            onClick={() => setTab(x.key)}
            className={cx(
              "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2.5 text-[13px] font-bold leading-tight whitespace-nowrap transition-all duration-150 sm:flex-row sm:gap-2 sm:text-sm",
              tab === x.key ? "bg-navy-900 text-white shadow-sm" : "text-ink-2 hover:bg-page hover:text-ink",
            )}
          >
            <x.icon className="size-4" />
            {x.label}
            <span className={cx("rounded-full px-1.5 py-0.5 text-[11px] font-bold", tab === x.key ? "bg-brand text-white" : "bg-page text-ink-3")}>{num(x.count)}</span>
          </button>
        ))}
      </div>

      {tab === "pickup" &&
        (tasks.pickupStops.length === 0 ? (
          <Card><Empty icon={Store} title={t("No pickups assigned")} /></Card>
        ) : (
          <div className="space-y-4">
            {tasks.pickupStops.map((s, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">{s.merchantName}</p>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-brand" /> {s.pickupAddress}
                    </p>
                  </div>
                  <a href={`tel:${s.merchantPhone}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 transition hover:bg-emerald-600 hover:scale-105" aria-label={t("Call merchant")}>
                    <Phone className="size-5" />
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.parcels.map((p) => (
                    <span key={p._id} className="rounded-lg bg-page px-2 py-1 font-mono text-xs font-semibold">
                      {p.category && `${CATEGORY[p.category].emoji} `}
                      {p.trackingCode}
                    </span>
                  ))}
                </div>
                <Button
                  className="mt-4 w-full"
                  size="lg"
                  disabled={pendingKeys.has(`stop:${s.parcels[0]._id}`)}
                  onClick={() => {
                    const ids = s.parcels.map((p) => p._id);
                    toast.undoable(
                      t("{n} parcel(s) picked up.", { n: ids.length }),
                      async () => {
                        for (const id of ids) await update({ token, id, to: "picked_up" });
                      },
                      `stop:${ids[0]}`,
                    );
                  }}
                >
                  {t("Picked up all {n}", { n: s.parcels.length })}
                </Button>
              </Card>
            ))}
          </div>
        ))}

      {tab !== "pickup" &&
        ((tab === "deliver" ? tasks.deliveries : tasks.onHold).length === 0 ? (
          <Card>
            <Empty icon={PackageCheck} title={tab === "deliver" ? t("No deliveries right now") : t("Nothing on hold")} text={t("Parcels assigned to you will appear here.")} />
          </Card>
        ) : (
          <div className="space-y-4">
            {(tab === "deliver" ? tasks.deliveries : tasks.onHold).map((p) => (
              <Card key={p._id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold">{p.trackingCode}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="mt-2 text-lg font-bold">{p.recipientName}</p>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-brand" /> {p.recipientAddress}, {p.district}
                    </p>
                    {p.zone === "uttara" && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand px-2 py-1 text-xs font-bold text-white">⚡ {t("3-hour express")}</p>
                    )}
                    {p.category && (
                      <p className="mt-2 text-xs font-semibold text-ink-2">
                        {CATEGORY[p.category].emoji} {CATEGORY[p.category].label}
                        {p.itemDescription && ` · ${p.itemDescription}`}
                      </p>
                    )}
                    {!p.category && p.itemDescription && <p className="mt-1 text-xs text-ink-3">{t("Item")}: {p.itemDescription}</p>}
                    {p.category && CATEGORY[p.category].careful && (
                      <p className="mt-1 rounded-lg bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">{CATEGORY[p.category].careful}</p>
                    )}
                    {p.note && <p className="mt-1 rounded-lg bg-sun-100 px-2 py-1 text-xs font-medium text-amber-900">{t("Note")}: {p.note}</p>}
                  </div>
                  <a href={`tel:${p.recipientPhone}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 transition hover:bg-emerald-600 hover:scale-105" aria-label={t("Call customer")}>
                    <Phone className="size-5" />
                  </a>
                </div>
                <div className="my-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
                  <span className="text-sm font-semibold text-brand-700">{t("Collect")}</span>
                  <span className="text-xl font-extrabold text-brand-700">{tk(p.codAmount)}</span>
                </div>
                <StatusActions
                  parcelId={p._id}
                  codAmount={p.codAmount}
                  moves={p.status === "out_for_delivery" ? ["delivered", "partial_delivered", "hold", "returning"] : ["out_for_delivery"]}
                />
              </Card>
            ))}
          </div>
        ))}
    </>
  );
}

export function RiderCash() {
  const { token } = useAuthed();
  const cash = useQuery(api.money.riderCash, { token });
  if (!cash) return <Spinner />;
  return (
    <>
      <PageHeader title={t("Cash in hand")} subtitle={t("Hand this over at the office. The admin will mark it received.")} />
      <Card className="sunrise mb-5 border-0 p-6 text-white">
        <p className="text-sm text-white/70">{t("Total to hand over")}</p>
        <p className="text-4xl font-extrabold">{tk(cash.total)}</p>
      </Card>
      <Card className="divide-y divide-line">
        {cash.parcels.length === 0 ? (
          <Empty icon={Banknote} title={t("No cash to hand over")} />
        ) : (
          cash.parcels.map((p) => (
            <div key={p._id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-mono font-bold">{p.trackingCode}</p>
                <p className="text-ink-3">{p.recipientName}{p.finalAt && ` · ${dateTime(p.finalAt)}`}</p>
              </div>
              <p className="font-bold">{tk(p.collectedAmount)}</p>
            </div>
          ))
        )}
      </Card>
      {cash.deposits.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-bold">{t("Handed over")}</h2>
          <Card className="divide-y divide-line">
            {cash.deposits.map((d) => (
              <div key={d._id} className="flex items-center justify-between p-4 text-sm">
                <span className="text-ink-2">{dateTime(d.createdAt)} · {t("{n} parcels", { n: d.parcelCount })}</span>
                <span className="font-bold text-emerald-700">{tk(d.amount)}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
}

