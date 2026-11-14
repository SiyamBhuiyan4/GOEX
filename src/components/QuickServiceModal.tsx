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
import { Button, Card, Field, Input, Modal, Select, Textarea, cx } from "./ui";

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

function resolveService(input?: string): string {
  if (!input) return SERVICES[0].name;
  const q = input.toLowerCase().trim();
  const found = SERVICES.find(
    (s) =>
      s.name.toLowerCase() === q ||
      s.id.toLowerCase() === q ||
      s.shortName.toLowerCase() === q ||
      s.name.toLowerCase().includes(q) ||
      q.includes(s.id.toLowerCase()),
  );
  return found ? found.name : SERVICES[0].name;
}

export function QuickServiceModal({
  open,
  onClose,
  initialService,
  defaultArea = "Savar",
}: QuickServiceModalProps) {
  const [service, setService] = useState<string>(() => resolveService(initialService));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState<"Dhaka" | "Savar" | "Other">(defaultArea);
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialService) {
        setService(resolveService(initialService));
      }
      if (defaultArea) {
        setArea(defaultArea);
      }
    }
  }, [open, initialService, defaultArea]);

  const whatsappMessageText = useMemo(() => {
    const lines: string[] = [
      `*⚡ GOEX Quick Order / Booking Request*`,
      `----------------------------------------`,
      `📦 *Service:* ${service}`,
      name.trim() ? `👤 *Customer Name:* ${name.trim()}` : null,
      phone.trim() ? `📞 *Phone Number:* ${phone.trim()}` : null,
      `📍 *Delivery Area:* ${area}`,
      address.trim() ? `🏠 *Delivery Address:* ${address.trim()}` : null,
      notes.trim() ? `📝 *Notes/Quantity:* ${notes.trim()}` : null,
      `----------------------------------------`,
      `_Sent via GOEX Express Quick Booking Portal_`,
    ].filter(Boolean) as string[];

    return lines.join("\n");
  }, [service, name, phone, area, address, notes]);

  const whatsappUrl = useMemo(() => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessageText)}`;
  }, [whatsappMessageText]);

  const callUrl = `tel:${HOTLINE_PHONE}`;

  const copyOrderDetails = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore clipboard rejection in some sandboxes */
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("Quick Order / Book Service")}
      wide
      footer={
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Direct Trigger 1: Call to Order Now */}
          <a href={callUrl} className="w-full">
            <Button
              type="button"
              variant="outline"
              size="lg"
              icon={PhoneCall}
              className="w-full justify-center border-line font-bold text-ink hover:border-brand hover:text-brand"
            >
              {t("Call to Order Now")}
            </Button>
          </a>

          {/* Direct Trigger 2: Order on WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              type="button"
              variant="primary"
              size="lg"
              icon={MessageCircle}
              className="w-full justify-center !bg-emerald-600 font-bold text-white hover:!bg-emerald-700 !shadow-md !shadow-emerald-600/25"
            >
              {t("Order on WhatsApp")}
            </Button>
          </a>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Subheader info banner */}
        <div className="rounded-2xl border border-line bg-page/70 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand">
                {t("Instant Hotline & WhatsApp Booking")}
              </p>
              <p className="mt-0.5 text-xs text-ink-2">
                {t("Fill out this quick form to place your order directly via WhatsApp or Phone Call")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs">
              <span className="font-semibold text-ink">{t("Direct Hotline")}:</span>
              <a
                href={callUrl}
                className="font-bold text-brand hover:underline"
              >
                {HOTLINE_DISPLAY}
              </a>
            </div>
          </div>
        </div>

        {/* Visual Service Selection Cards */}
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-ink-2">
            {t("Select Service")}
          </label>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => {
              const isSelected = service === s.name;
              const Icon = s.icon;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setService(s.name)}
                  className="w-full text-left transition-transform active:scale-[0.98]"
                >
                  <Card
                    className={cx(
                      "cursor-pointer border p-3.5 transition-all duration-150 hover:-translate-y-0.5",
                      isSelected
                        ? "border-brand bg-brand-50/25 ring-2 ring-brand/35 shadow-sm dark:bg-brand-500/10"
                        : "border-line hover:border-navy-200 hover:bg-page/50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cx(
                          "grid size-9 shrink-0 place-items-center rounded-xl",
                          isSelected
                            ? "bg-brand text-white shadow-xs"
                            : s.colorTone,
                        )}
                      >
                        <Icon className="size-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-xs font-extrabold text-ink">
                            {s.shortName}
                          </span>
                          {isSelected && (
                            <span className="grid size-4 shrink-0 place-items-center rounded-full bg-brand text-white">
                              <Check className="size-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-1 text-[11px] font-medium text-ink-3">
                          {s.badge}
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs: Customer Name & Phone Number */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("Customer Name")}>
            {(id) => (
              <Input
                id={id}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("e.g. Rahim Ahmed")}
                autoComplete="name"
              />
            )}
          </Field>

          <Field label={t("Phone number")}>
            {(id) => (
              <Input
                id={id}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                autoComplete="tel"
              />
            )}
          </Field>
        </div>

        {/* Inputs: Area & Delivery Address */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <Field label={t("Area")}>
              {(id) => (
                <Select
                  id={id}
                  value={area}
                  onChange={(e) => setArea(e.target.value as "Dhaka" | "Savar" | "Other")}
                >
                  <option value="Savar">{t("Savar")}</option>
                  <option value="Dhaka">{t("Dhaka")}</option>
                  <option value="Other">{t("Other")}</option>
                </Select>
              )}
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label={t("Delivery Address")}>
              {(id) => (
                <Input
                  id={id}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("House/Road, Area, Landmark")}
                  autoComplete="street-address"
                />
              )}
            </Field>
          </div>
        </div>

        {/* Input: Notes / Quantity */}
        <Field
          label={t("Notes/Quantity")}
          hint={t("Specify quantity (e.g. 2L milk, 1 lunch box) or preferred delivery time")}
        >
          {(id) => (
            <Textarea
              id={id}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("e.g. 2 liters pure cow milk every morning, or hot lunch delivery before 1:00 PM")}
              rows={2}
            />
          )}
        </Field>

        {/* Message Preview & Quick Copy */}
        <Card className="border border-line bg-page/50 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="size-4 shrink-0 text-brand" />
              <p className="truncate text-xs font-medium text-ink-2">
                {t("Order details will be sent directly to our official WhatsApp")}
              </p>
            </div>
            <button
              type="button"
              onClick={copyOrderDetails}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink-2 shadow-xs transition hover:border-navy-200 hover:text-ink active:scale-95"
              title={t("Copy Order Text")}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-600">{t("Copied!")}</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-ink-3" />
                  <span>{t("Copy Text")}</span>
                </>
              )}
            </button>
          </div>
        </Card>
      </div>
    </Modal>
  );
}

export default QuickServiceModal;
