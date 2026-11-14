import {
  ChefHat,
  CheckCircle2,
  Clock,
  MessageCircle,
  Milk,
  Phone,
  PhoneCall,
  ShoppingBag,
  Sparkles,
  Truck,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { CONTACT } from "../lib/contact";
import { t } from "../lib/prefs";
import { Card, cx } from "./ui";

export interface GoexServiceItem {
  id: string;
  emoji: string;
  icon: LucideIcon;
  titleKey: string;
  badgeKey: string;
  descriptionKey: string;
  highlights: string[];
  theme: {
    accentBorder: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconText: string;
    glowBg: string;
  };
  whatsappText: string;
}

export const GOEX_SERVICES_LIST: GoexServiceItem[] = [
  {
    id: "office-lunch",
    emoji: "🍱",
    icon: Utensils,
    titleKey: "Home-to-Office Lunch Delivery",
    badgeKey: "Hot & Fresh Daily",
    descriptionKey:
      "Every day, GoEx Fast Delivery brings hot, home-cooked lunch straight from your home to your office desk on time.",
    highlights: [
      "Insulated Thermal Delivery",
      "On-Time Office Desk Reach",
      "Reliable Daily Subscription",
    ],
    theme: {
      accentBorder: "hover:border-violet-400/80 hover:shadow-violet-500/10",
      badgeBg: "bg-violet-100 dark:bg-violet-500/20",
      badgeText: "text-violet-800 dark:text-violet-300",
      iconBg: "bg-violet-500/10 dark:bg-violet-500/20",
      iconText: "text-violet-600 dark:text-violet-400",
      glowBg: "from-violet-500/5 via-transparent to-transparent",
    },
    whatsappText:
      "Hello GoEx! I would like to order / subscribe to Home-to-Office Lunch Delivery (বাসা টু অফিস লাঞ্চ).",
  },
  {
    id: "farm-milk",
    emoji: "🥛",
    icon: Milk,
    titleKey: "100% Pure Farm Cow Milk",
    badgeKey: "100% Pure & Fresh",
    descriptionKey:
      "100% pure cow milk sourced directly from trusted dairy farms, delivered fresh to your address on time.",
    highlights: [
      "Pure & Unadulterated (Raw/Fresh)",
      "Morning Doorstep Delivery",
      "Ethically Sourced Dairy Farm",
    ],
    theme: {
      accentBorder: "hover:border-violet-400/80 hover:shadow-violet-500/10",
      badgeBg: "bg-violet-100 dark:bg-violet-500/20",
      badgeText: "text-violet-800 dark:text-violet-300",
      iconBg: "bg-violet-500/10 dark:bg-violet-500/20",
      iconText: "text-violet-600 dark:text-violet-400",
      glowBg: "from-violet-500/5 via-transparent to-transparent",
    },
    whatsappText:
      "Hello GoEx! I would like to order 100% Pure Farm Cow Milk (খামার থেকে খাঁটি গরুর দুধ).",
  },
  {
    id: "mess-meals",
    emoji: "🍛",
    icon: ChefHat,
    titleKey: "Affordable Local Hotel Food & Bachelor Mess Meals",
    badgeKey: "Budget Friendly & Tasty",
    descriptionKey:
      "Forget expensive restaurants! Enjoy warm rice, beef curry, and comforting meals from the best local hotels delivered right to your home or bachelor mess.",
    highlights: [
      "Warm Rice & Rich Beef Curry",
      "Best Local Hotel Taste",
      "Budget-Friendly Mess Rates",
    ],
    theme: {
      accentBorder: "hover:border-fuchsia-400/80 hover:shadow-fuchsia-500/10",
      badgeBg: "bg-fuchsia-100 dark:bg-fuchsia-500/20",
      badgeText: "text-fuchsia-800 dark:text-fuchsia-300",
      iconBg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
      iconText: "text-fuchsia-600 dark:text-fuchsia-400",
      glowBg: "from-fuchsia-500/5 via-transparent to-transparent",
    },
    whatsappText:
      "Hello GoEx! I want to order Affordable Local Hotel Food & Bachelor Mess Meals (লোকাল হোটেল ও মেস মিল).",
  },
  {
    id: "grocery-essentials",
    emoji: "🛒",
    icon: ShoppingBag,
    titleKey: "Grocery & Daily Essentials",
    badgeKey: "Superfast Home Delivery",
    descriptionKey:
      "Corporate lunch, mess meals, pure milk, and daily grocery bazaar delivered superfast to your home.",
    highlights: [
      "Fresh Vegetables & Groceries",
      "Daily Cooking Ingredients",
      "Fast Doorstep Delivery",
    ],
    theme: {
      accentBorder: "hover:border-violet-400/80 hover:shadow-violet-500/10",
      badgeBg: "bg-violet-100 dark:bg-violet-500/20",
      badgeText: "text-violet-800 dark:text-violet-300",
      iconBg: "bg-violet-500/10 dark:bg-violet-500/20",
      iconText: "text-violet-600 dark:text-violet-400",
      glowBg: "from-violet-500/5 via-transparent to-transparent",
    },
    whatsappText:
      "Hello GoEx! I need Grocery & Daily Essentials delivery (মুদি বাজার).",
  },
  {
    id: "express-courier",
    emoji: "⚡",
    icon: Truck,
    titleKey: "Dhaka & Savar Express Courier",
    badgeKey: "Express Courier",
    descriptionKey:
      "Superfast and reliable courier delivery for all your urgent parcels across Savar and all over Dhaka.",
    highlights: [
      "Complete Savar & Dhaka Coverage",
      "Urgent Parcel & Document Dispatch",
      "Safe & Verified Fast Riders",
    ],
    theme: {
      accentBorder: "hover:border-brand/80 hover:shadow-brand/10",
      badgeBg: "bg-brand-100 dark:bg-brand-500/20",
      badgeText: "text-brand-700 dark:text-brand-300",
      iconBg: "bg-brand/10 dark:bg-brand/20",
      iconText: "text-brand dark:text-brand-400",
      glowBg: "from-brand/5 via-transparent to-transparent",
    },
    whatsappText:
      "Hello GoEx! I need urgent Dhaka & Savar Express Courier delivery (পার্সেল ও কুরিয়ার).",
  },
];

export interface GoexServicesProps {
  /** Optional container CSS class */
  className?: string;
  /** Whether to show the top header block */
  showHeading?: boolean;
  /** Section title override */
  title?: string;
  /** Section subtitle override */
  subtitle?: string;
  /** Eyebrow kicker badge override */
  kicker?: string;
  /** Phone number (defaults to 01348756651) */
  phone?: string;
  /** Formatted phone display (defaults to 01348-756651) */
  phoneDisplay?: string;
  /** WhatsApp base URL (defaults to https://wa.me/8801348756651) */
  whatsapp?: string;
  /** Highlighted or active service ID */
  highlightId?: string;
  /** Compact card layout mode */
  compact?: boolean;
  /** Optional order action callback */
  onOrder?: (service: GoexServiceItem) => void;
  /** Whether to show the bottom 24/7 hotline banner */
  showHotlineBanner?: boolean;
}

/**
 * GoexServices Component
 * Displays the 5 official flagship services aligned with the GOEX Facebook page:
 * 1. Home-to-Office Lunch Delivery
 * 2. 100% Pure Farm Cow Milk
 * 3. Affordable Local Hotel Food & Bachelor Mess Meals
 * 4. Grocery & Daily Essentials
 * 5. Dhaka & Savar Express Courier
 */
export function GoexServices({
  className,
  showHeading = true,
  title,
  subtitle,
  kicker,
  phone = CONTACT.phone || "01348756651",
  phoneDisplay = CONTACT.phoneDisplay || "01348-756651",
  whatsapp = CONTACT.whatsapp || "https://wa.me/8801348756651",
  highlightId,
  compact = false,
  onOrder,
  showHotlineBanner = true,
}: GoexServicesProps) {
  const getWaLink = (item: GoexServiceItem) => {
    const cleanNumber = phone.replace(/\D/g, "");
    const baseWa = whatsapp.startsWith("http")
      ? whatsapp
      : `https://wa.me/88${cleanNumber}`;
    const sep = baseWa.includes("?") ? "&" : "?";
    return `${baseWa}${sep}text=${encodeURIComponent(item.whatsappText)}`;
  };

  return (
    <div className={cx("w-full transition-colors", className)}>
      {showHeading && (
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-50/80 px-3.5 py-1 text-xs font-bold text-brand shadow-xs dark:bg-brand-500/10">
            <Sparkles className="size-3.5 animate-pulse" />
            <span>{kicker ?? t("GOEX Flagship Services")}</span>
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            {title ?? t("Tailored Fast Delivery for Your Daily Life")}
          </h2>
          <p className="mt-3 text-sm text-ink-2 sm:text-base">
            {subtitle ??
              t(
                "From hot home-cooked office lunches and pure dairy milk to local hotel meals, grocery bazaar, and express courier — GoEx delivers with speed and trust.",
              )}
          </p>

          {/* Quick hotline bar */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-xl bg-surface border border-line px-4 py-2 text-xs font-bold text-ink shadow-xs transition hover:border-brand/40 hover:bg-page hover:text-brand"
            >
              <PhoneCall className="size-3.5 text-brand" />
              <span>{t("Call Helpline")}:</span>
              <span className="font-extrabold text-brand">{phoneDisplay}</span>
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700"
            >
              <MessageCircle className="size-3.5" />
              <span>{t("WhatsApp")}:</span>
              <span className="font-extrabold">{phoneDisplay}</span>
            </a>
          </div>
        </div>
      )}

      {/* Flagship Services Grid */}
      <div
        className={cx(
          "grid gap-6",
          compact
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {GOEX_SERVICES_LIST.map((item, index) => {
          const Icon = item.icon;
          const isHighlighted = highlightId === item.id;
          const isLargeSpotlight = !compact && index === 0;

          return (
            <Card
              key={item.id}
              className={cx(
                "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-6 transition-all duration-300",
                "hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:bg-surface/90",
                item.theme.accentBorder,
                isHighlighted && "ring-2 ring-brand border-brand shadow-lg",
                isLargeSpotlight && "md:col-span-2 lg:col-span-1",
              )}
            >
              {/* Subtle top background glow */}
              <div
                className={cx(
                  "pointer-events-none absolute -inset-px -top-12 h-36 bg-gradient-to-b opacity-50 transition-opacity duration-300 group-hover:opacity-100",
                  item.theme.glowBg,
                )}
              />

              <div className="relative z-10">
                {/* Header: Icon, Emoji & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cx(
                        "grid size-12 shrink-0 place-items-center rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-110",
                        item.theme.iconBg,
                        item.theme.iconText,
                      )}
                    >
                      <Icon className="size-6" />
                    </div>
                    <span className="text-3xl select-none">{item.emoji}</span>
                  </div>

                  <span
                    className={cx(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-xs whitespace-nowrap",
                      item.theme.badgeBg,
                      item.theme.badgeText,
                    )}
                  >
                    <Sparkles className="size-3" />
                    {t(item.badgeKey)}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="mt-4">
                  <h3 className="text-lg font-extrabold text-ink transition-colors group-hover:text-brand sm:text-xl">
                    {t(item.titleKey)}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-ink-2">
                    {t(item.descriptionKey)}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="mt-4 pt-3 border-t border-line/60 dark:border-white/5 space-y-2">
                  {item.highlights.map((hKey) => (
                    <div
                      key={hKey}
                      className="flex items-center gap-2 text-xs font-semibold text-ink-2"
                    >
                      <CheckCircle2
                        className={cx(
                          "size-4 shrink-0 transition-colors",
                          item.theme.iconText,
                        )}
                      />
                      <span>{t(hKey)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions: Call Now & Order on WhatsApp */}
              <div className="relative z-10 mt-6 pt-4 border-t border-line dark:border-white/10 flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={`tel:${phone}`}
                  className="w-full sm:w-1/2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-bold text-ink shadow-xs transition-all hover:bg-page hover:border-brand/40 hover:text-brand active:scale-[0.98] dark:border-white/10 dark:hover:bg-navy-800"
                  aria-label={`${t("Call Now")} - ${phoneDisplay}`}
                >
                  <Phone className="size-3.5 text-brand shrink-0" />
                  <span>{t("Call Now")}</span>
                </a>

                <a
                  href={getWaLink(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onOrder?.(item)}
                  className="w-full sm:w-1/2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#25D366]/20 transition-all hover:bg-[#20ba5a] hover:shadow-md hover:shadow-[#25D366]/30 active:scale-[0.98]"
                  aria-label={`${t("Order on WhatsApp")} - ${t(item.titleKey)}`}
                >
                  <MessageCircle className="size-3.5 shrink-0" />
                  <span>{t("Order Now")}</span>
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 24/7 Hotline & Savar/Dhaka Guarantee Banner */}
      {showHotlineBanner && (
        <div className="mt-10 overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-r from-brand-50 via-surface to-brand-50/50 p-6 shadow-sm dark:border-white/10 dark:from-navy-900 dark:via-surface dark:to-navy-900">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-0.5 text-xs font-bold text-brand dark:bg-brand/20">
                <Clock className="size-3.5" />
                <span>{t("Available 24/7 in Savar & Dhaka")}</span>
              </div>
              <h4 className="text-lg font-extrabold text-ink sm:text-xl">
                {t("Need any delivery service? We are one call away!")}
              </h4>
              <p className="text-xs sm:text-sm text-ink-2 max-w-xl">
                {t(
                  "Doorstep delivery across all major areas of Dhaka & Savar. Call our 24/7 helpline or order instantly via WhatsApp.",
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-600 active:scale-[0.98]"
              >
                <PhoneCall className="size-4" />
                <span>{t("Call Helpline: 01348-756651")}</span>
              </a>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-600/30 transition hover:bg-violet-700 active:scale-[0.98]"
              >
                <MessageCircle className="size-4" />
                <span>{t("WhatsApp: 01348-756651")}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoexServices;
