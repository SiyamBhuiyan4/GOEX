import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  MessageCircle,
  Milk,
  PhoneCall,
  ShoppingBag,
  Snowflake,
  Soup,
  Sparkles,
  Truck,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { CONTACT } from "../lib/contact";
import { t } from "../lib/prefs";
import { Button, Field, Input, Modal, Select, Textarea, cx } from "./ui";

export interface QuickServiceModalProps {
  open: boolean;
  onClose: () => void;
  initialService?: string;
  defaultArea?: "Dhaka" | "Savar" | "Other";
}

export interface QuickServiceItem {
  id: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  badge: string;
  desc: string;
  colorTone: string;
}

export const SERVICES: QuickServiceItem[] = [
  {
    id: "lunch",
    name: "Home-to-Office Lunch (বাসা টু অফিস লাঞ্চ)",
    shortName: "Office Lunch",
    icon: Utensils,
    badge: "Hot & on time",
    desc: "We collect your home-cooked lunch on your schedule and deliver it hot to your office desk.",
    colorTone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  },
  {
    id: "meal",
    name: "Bachelor & Mess Meals (ব্যাচেলর ও মেস মিল)",
    shortName: "Mess Meals",
    icon: Soup,
    badge: "Budget friendly",
    desc: "Fresh food from the best local rice hotels at affordable prices, delivered to your room.",
    colorTone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  },
  {
    id: "milk",
    name: "Pure Farm Cow Milk (খাঁটি গরুর দুধ)",
    shortName: "Cow Milk",
    icon: Milk,
    badge: "100% pure & fresh",
    desc: "Pure cow milk collected straight from trusted farms and delivered to your home every day.",
    colorTone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  },
  {
    id: "grocery",
    name: "Grocery from Your Shop (মুদি বাজার)",
    shortName: "Grocery",
    icon: ShoppingBag,
    badge: "Your chosen shop",
    desc: "Tell us your shop — rice, dal, oil and all daily essentials bought there and brought to your door.",
    colorTone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  },
  {
    id: "parcel",
    name: "Express Parcel Delivery (এক্সপ্রেস পার্সেল)",
    shortName: "Express Parcel",
    icon: Truck,
    badge: "Same-day express",
    desc: "Any parcel delivered superfast across Savar & Dhaka, with parcel tracking.",
    colorTone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  },
  {
    id: "perishable",
    name: "Fish, Meat, Frozen & Cake Express (মাছ, মাংস, ফ্রোজেন ও কেক)",
    shortName: "Perishable Express",
    icon: Snowflake,
    badge: "Same-city express",
    desc: "Fish, meat, frozen food and cakes delivered extra fast within the same city, kept cold and safe.",
    colorTone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  },
];

const HOTLINE_PHONE = "01348756651";
const HOTLINE_DISPLAY = CONTACT?.phoneDisplay || "01348-756651";
const WHATSAPP_NUMBER = "8801348756651";

/* ------------------------------------------------------------------ order forms
  Each service collects what it actually needs:
  - Milk is GOEX's own product → direct order (quantity, schedule, address).
  - Everything else is picked up somewhere and delivered somewhere else, so it
    asks where to collect from, what to collect, and where/when to deliver.
*/

type FieldType = "text" | "textarea" | "select" | "number" | "time" | "date" | "tel";

interface OrderField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  wide?: boolean;
}

const ORDER_FIELDS: Record<string, OrderField[]> = {
  milk: [
    { key: "qty", label: "Quantity", type: "select", options: ["½ litre", "1 litre", "2 litres", "3 litres", "5 litres"], required: true },
    { key: "schedule", label: "How often", type: "select", options: ["Every day", "One time only"], required: true },
    { key: "slot", label: "Delivery time", type: "select", options: ["Morning", "Evening"], required: true },
    { key: "start", label: "Start date", type: "date" },
    { key: "area", label: "Area", type: "select", options: ["Savar", "Dhaka"], required: true },
    { key: "address", label: "Delivery address", type: "text", placeholder: "House/Road, Area, Landmark", required: true, wide: true },
  ],
  lunch: [
    { key: "pickup", label: "Pickup address (home)", type: "text", placeholder: "Where we collect the lunch box", required: true, wide: true },
    { key: "pickupTime", label: "Pickup time", type: "time", required: true },
    { key: "plan", label: "Plan", type: "select", options: ["Every working day", "One day only"], required: true },
    { key: "drop", label: "Office name & address", type: "text", placeholder: "Office, floor, desk", required: true, wide: true },
    { key: "dropTime", label: "Deliver by", type: "time", required: true },
  ],
  meal: [
    { key: "hotel", label: "Hotel / restaurant", type: "text", placeholder: "Leave blank and we'll pick the best local hotel", wide: true },
    { key: "meal", label: "Meal", type: "select", options: ["Lunch", "Dinner", "Lunch & dinner"], required: true },
    { key: "people", label: "Number of meals", type: "number", placeholder: "1", required: true },
    { key: "menu", label: "Menu", type: "textarea", placeholder: "e.g. rice, beef curry, dal", wide: true },
    { key: "drop", label: "Delivery address (mess / room)", type: "text", placeholder: "Mess, room, area", required: true, wide: true },
    { key: "dropTime", label: "Deliver by", type: "time" },
  ],
  grocery: [
    { key: "shop", label: "Shop name & address", type: "text", placeholder: "The shop we should buy from", required: true, wide: true },
    { key: "items", label: "Shopping list", type: "textarea", placeholder: "e.g. rice 5 kg, dal 1 kg, soybean oil 2 L", required: true, wide: true },
    { key: "drop", label: "Delivery address", type: "text", placeholder: "House/Road, Area, Landmark", required: true, wide: true },
  ],
  parcel: [
    { key: "pickup", label: "Pickup address", type: "text", placeholder: "Where we collect the parcel", required: true, wide: true },
    { key: "item", label: "What's in the parcel", type: "text", placeholder: "e.g. clothes, documents, ~1 kg", required: true, wide: true },
    { key: "receiver", label: "Receiver name", type: "text", required: true },
    { key: "receiverPhone", label: "Receiver phone", type: "tel", placeholder: "01XXXXXXXXX", required: true },
    { key: "drop", label: "Delivery address", type: "text", placeholder: "House/Road, Area, Landmark", required: true, wide: true },
    { key: "cod", label: "Cash to collect (৳)", type: "number", placeholder: "0 if prepaid" },
  ],
  perishable: [
    { key: "item", label: "Item", type: "select", options: ["Fish", "Meat", "Frozen food", "Cake", "Other"], required: true },
    { key: "deadline", label: "Deliver by", type: "time", required: true },
    { key: "pickup", label: "Pickup address", type: "text", placeholder: "Shop, bakery or home", required: true, wide: true },
    { key: "receiver", label: "Receiver name", type: "text", required: true },
    { key: "receiverPhone", label: "Receiver phone", type: "tel", placeholder: "01XXXXXXXXX", required: true },
    { key: "drop", label: "Delivery address", type: "text", placeholder: "House/Road, Area, Landmark", required: true, wide: true },
  ],
};

function resolveServiceId(input?: string): string {
  if (!input) return SERVICES[0].id;
  const q = input.toLowerCase().trim();
  const found = SERVICES.find(
    (s) => s.id === q || s.name.toLowerCase() === q || s.shortName.toLowerCase() === q || s.name.toLowerCase().includes(q),
  );
  return found ? found.id : SERVICES[0].id;
}

const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;

export function QuickServiceModal({ open, onClose, initialService }: QuickServiceModalProps) {
  const [serviceId, setServiceId] = useState<string>(() => resolveServiceId(initialService));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setServiceId(resolveServiceId(initialService));
      setShowErrors(false);
    }
  }, [open, initialService]);

  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0];
  const fields = ORDER_FIELDS[service.id] ?? [];

  // Selects default to their first option so the message is always complete.
  const valueOf = (f: OrderField) => values[`${service.id}.${f.key}`] ?? (f.type === "select" ? f.options![0] : "");
  const setValue = (f: OrderField, v: string) => setValues((cur) => ({ ...cur, [`${service.id}.${f.key}`]: v }));

  const phoneOk = PHONE_RE.test(phone.replace(/[\s-]/g, ""));
  const missing = new Set<string>([
    ...(name.trim() ? [] : ["name"]),
    ...(phoneOk ? [] : ["phone"]),
    ...fields.filter((f) => f.required && !valueOf(f).trim()).map((f) => f.key),
  ]);

  const message = useMemo(() => {
    const lines = [
      `*GOEX Order — ${service.shortName}*`,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      ...fields.filter((f) => valueOf(f).trim()).map((f) => `${f.label}: ${valueOf(f).trim()}`),
      notes.trim() ? `Note: ${notes.trim()}` : "",
    ].filter(Boolean);
    return lines.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, name, phone, notes, values]);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const callUrl = `tel:${HOTLINE_PHONE}`;
  const err = (key: string) => showErrors && missing.has(key);
  const errCls = (key: string) => (err(key) ? "!border-red-500 ring-2 ring-red-500/20" : undefined);

  const copyOrderDetails = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard can be blocked */
    }
  };

  const renderControl = (f: OrderField, id: string) => {
    const common = { id, value: valueOf(f), className: errCls(f.key) };
    if (f.type === "select")
      return (
        <Select {...common} onChange={(e) => setValue(f, e.target.value)}>
          {f.options!.map((o) => (
            <option key={o} value={o}>
              {t(o)}
            </option>
          ))}
        </Select>
      );
    if (f.type === "textarea")
      return <Textarea {...common} rows={2} placeholder={f.placeholder && t(f.placeholder)} onChange={(e) => setValue(f, e.target.value)} />;
    return (
      <Input
        {...common}
        type={f.type}
        min={f.type === "number" ? 0 : undefined}
        inputMode={f.type === "number" ? "numeric" : undefined}
        placeholder={f.placeholder && t(f.placeholder)}
        onChange={(e) => setValue(f, e.target.value)}
      />
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("Place an order")}
      wide
      footer={
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <a href={callUrl} className="w-full">
            <Button type="button" variant="outline" size="lg" icon={PhoneCall} className="w-full justify-center font-bold">
              {t("Call")} {HOTLINE_DISPLAY}
            </Button>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
            onClick={(e) => {
              if (missing.size) {
                e.preventDefault();
                setShowErrors(true);
              }
            }}
          >
            <Button
              type="button"
              size="lg"
              icon={MessageCircle}
              className="w-full justify-center !bg-emerald-600 font-bold text-white hover:!bg-emerald-700"
            >
              {t("Send order on WhatsApp")}
            </Button>
          </a>
        </div>
      }
    >
      <div className="space-y-6">
        {/* service picker */}
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
          {SERVICES.map((s) => {
            const selected = s.id === service.id;
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => {
                  setServiceId(s.id);
                  setShowErrors(false);
                }}
                className={cx(
                  "flex items-center gap-3 rounded-2xl border p-3 text-left transition",
                  selected ? "border-brand bg-brand-50/60 ring-2 ring-brand/30 dark:bg-brand-500/10" : "border-line hover:border-brand/40",
                )}
              >
                <span className={cx("grid size-9 shrink-0 place-items-center rounded-xl", selected ? "bg-brand text-white" : s.colorTone)}>
                  <s.icon className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-ink">{t(s.shortName)}</span>
                  <span className="block truncate text-[11px] text-ink-3">{t(s.badge)}</span>
                </span>
                {selected && <Check className="ml-auto size-4 shrink-0 text-brand" />}
              </button>
            );
          })}
        </div>

        <p className="rounded-xl bg-page px-4 py-3 text-sm text-ink-2 ring-1 ring-line">{t(service.desc)}</p>

        {/* your contact */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Your name")} hint={err("name") ? t("Required") : undefined}>
            {(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={errCls("name")} />}
          </Field>
          <Field label={t("Your phone")} hint={err("phone") ? t("Enter a valid 11-digit mobile number") : undefined}>
            {(id) => (
              <Input
                id={id}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                autoComplete="tel"
                className={errCls("phone")}
              />
            )}
          </Field>
        </div>

        {/* service-specific details */}
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <Field
              key={`${service.id}.${f.key}`}
              label={t(f.label) + (f.required ? "" : ` (${t("optional")})`)}
              hint={err(f.key) ? t("Required") : undefined}
              className={f.wide ? "sm:col-span-2" : undefined}
            >
              {(id) => renderControl(f, id)}
            </Field>
          ))}
          <Field label={`${t("Note")} (${t("optional")})`} className="sm:col-span-2">
            {(id) => <Textarea id={id} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />}
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-ink-3">
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-brand" /> {t("Your order goes to our WhatsApp; we confirm the price and time with you.")}
          </span>
          <button type="button" onClick={copyOrderDetails} className="inline-flex shrink-0 items-center gap-1 font-semibold text-ink-2 hover:text-brand">
            {copied ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copied ? t("Copied!") : t("Copy order")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default QuickServiceModal;
