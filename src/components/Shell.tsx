import { useMemo, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Store,
  Bike,
  Wallet,
  Banknote,
  ShieldCheck,
  Settings,
  UserCircle,
  LogOut,
  Menu,
  X,
  Upload,
  ClipboardList,
  BadgeCheck,
  MessageCircle,
  MessagesSquare,
  Building2,
  PieChart,
  Users,
  TrendingUp,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FloatingChatButton } from "./Chat";
import { Link, useLocation } from "../lib/router";
import { useAuthed, useSession } from "../lib/session";
import { Logo, Wordmark, cx } from "./ui";
import { Prefs } from "./Prefs";
import { PageBoundary } from "./PageBoundary";
import { t } from "../lib/prefs";
import { CONTACT } from "../lib/contact";

type Role = "admin" | "merchant" | "rider";
type NavItem = { href: string; label: string; icon: LucideIcon };
type NavSection = { title: string; items: NavItem[] };

/*
  One navigation definition per role. The sidebar, the mobile drawer and the
  page title in the top bar all read from this.
*/
const ACCOUNT: NavSection = {
  title: "Account",
  items: [{ href: "/app/account", label: "Account", icon: UserCircle }],
};

const NAV: Record<Role, NavSection[]> = {
  admin: [
    {
      title: "Overview",
      items: [
        { href: "/app", label: "Dashboard", icon: LayoutDashboard },
        { href: "/app/parcels", label: "Parcels", icon: Package },
        { href: "/app/parcels/new", label: "New parcel", icon: PackagePlus },
      ],
    },
    {
      title: "People & operations",
      items: [
        { href: "/app/merchants", label: "Merchants", icon: Store },
        { href: "/app/riders", label: "Riders", icon: Bike },
        { href: "/app/hubs", label: "Hubs & warehouses", icon: Building2 },
        { href: "/app/hrm", label: "HR & payroll", icon: Users },
        { href: "/app/messages", label: "Merchant messages", icon: MessageCircle },
        { href: "/app/rider-messages", label: "Rider messages", icon: MessagesSquare },
      ],
    },
    {
      title: "Finance",
      items: [
        { href: "/app/accounts", label: "Accounts", icon: PieChart },
        { href: "/app/commissions", label: "Commissions", icon: TrendingUp },
        { href: "/app/payouts", label: "Merchant payouts", icon: Wallet },
        { href: "/app/cash", label: "Rider cash", icon: Banknote },
        { href: "/app/settings", label: "Delivery rates", icon: Settings },
      ],
    },
    { title: "Tools", items: [{ href: "/app/fraud", label: "Fraud check", icon: ShieldCheck }] },
    ACCOUNT,
  ],
  merchant: [
    {
      title: "Deliveries",
      items: [
        { href: "/app", label: "Dashboard", icon: LayoutDashboard },
        { href: "/app/parcels/new", label: "Create parcel", icon: PackagePlus },
        { href: "/app/parcels/bulk", label: "Bulk upload", icon: Upload },
        { href: "/app/parcels", label: "My parcels", icon: Package },
      ],
    },
    {
      title: "Business",
      items: [
        { href: "/app/payments", label: "Payments", icon: Wallet },
        { href: "/app/verify", label: "Business verification", icon: BadgeCheck },
        { href: "/app/fraud", label: "Fraud check", icon: ShieldCheck },
      ],
    },
    ACCOUNT,
  ],
  rider: [
    {
      title: "Work",
      items: [
        { href: "/app", label: "My tasks", icon: ClipboardList },
        { href: "/app/cash", label: "Cash in hand", icon: Banknote },
        { href: "/app/commissions", label: "My commissions", icon: TrendingUp },
      ],
    },
    ACCOUNT,
  ],
};

const ROLE_LABEL: Record<Role, string> = { admin: "Admin", merchant: "Merchant", rider: "Rider" };

/** The nav item whose link best matches the path: the longest href that is the path or a parent of it. */
function activeHref(path: string, items: NavItem[]) {
  let best: string | undefined;
  for (const { href } of items) {
    const hit = path === href || (href !== "/app" && path.startsWith(href + "/"));
    if (hit && (!best || href.length > best.length)) best = href;
  }
  return best;
}

/** Red count badge on the admin's message links. */
function UnreadDot({ role }: { role: "merchant" | "rider" }) {
  const { token } = useAuthed();
  const counts = useQuery(api.chat.unreadCount, { token });
  const n = counts?.[role] ?? 0;
  if (!n) return null;
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{n > 9 ? "9+" : n}</span>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { me } = useAuthed();
  const { signOut } = useSession();
  const { path } = useLocation();
  const [open, setOpen] = useState(false);

  const sections = NAV[me.role];
  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const active = activeHref(path, flat);
  const current = flat.find((i) => i.href === active);
  const displayName = me.businessName ?? me.name;
  const roleLabel = t(ROLE_LABEL[me.role]);

  const sidebar = (
    <div className="sunrise flex h-full flex-col">
      <Link href="/app" className="flex items-center gap-3 px-5 pb-5 pt-6 transition hover:opacity-90" onClick={() => setOpen(false)}>
        <Logo size={42} className="ring-2 ring-white/20" />
        <span>
          <Wordmark dark />
          <span className="mt-1 block text-[10px] font-bold tracking-[0.18em] text-sun/90 uppercase keep-tracking">{roleLabel}</span>
        </span>
      </Link>

      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-3">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-0.5">
            {sections.length > 2 && <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-white/40 uppercase">{t(sec.title)}</p>}
            {sec.items.map((it) => {
              const on = it.href === active;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  aria-current={on ? "page" : undefined}
                  className={cx(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors duration-150",
                    on ? "bg-brand text-white shadow-md shadow-brand/30" : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <it.icon className={cx("size-[18px]", on ? "text-white" : "text-white/50 group-hover:text-sun")} />
                  <span className="flex-1">{t(it.label)}</span>
                  {it.href === "/app/messages" && <UnreadDot role="merchant" />}
                  {it.href === "/app/rider-messages" && <UnreadDot role="rider" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="space-y-2 p-3">
        <a
          href={`tel:${CONTACT.phone}`}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <Phone className="size-3.5 text-sun" />
          <span>
            {t("Support")} · {CONTACT.phoneDisplay}
          </span>
        </a>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-bold text-white">{displayName.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{displayName}</span>
            <span className="block text-xs text-white/50">{roleLabel}</span>
          </span>
          <button
            onClick={() => void signOut()}
            className="cursor-pointer rounded-lg p-2 text-white/50 transition hover:bg-white/15 hover:text-white"
            title={t("Sign out")}
            aria-label={t("Sign out")}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col lg:pl-64">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* One top bar for every screen size */}
      <header className="no-print sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/85 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 hover:bg-page lg:hidden" aria-label={t("Menu")}>
          <Menu className="size-6" />
        </button>
        <Link href="/app" className="flex items-center gap-2 lg:hidden">
          <Logo size={32} />
        </Link>
        <div className="hidden min-w-0 items-center gap-2 text-sm lg:flex">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">{roleLabel}</span>
          {current && (
            <>
              <span className="text-ink-3">/</span>
              <span className="truncate font-semibold text-ink-2">{t(current.label)}</span>
            </>
          )}
        </div>
        <span className="min-w-0 truncate text-sm font-bold text-ink lg:hidden">{current ? t(current.label) : "GOEX"}</span>
        <div className="ml-auto flex items-center gap-3">
          <Prefs />
          <span className="hidden items-center gap-2.5 border-l border-line pl-3 sm:flex">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">{displayName.slice(0, 1).toUpperCase()}</span>
            <span className="max-w-40 truncate text-xs font-semibold text-ink">{displayName}</span>
          </span>
          <FloatingChatButton className="relative lg:hidden" />
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setOpen(false)} />
          <div className="animate-slide-in absolute inset-y-0 left-0 w-72">
            {sidebar}
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 hover:bg-white/10" aria-label={t("Close menu")}>
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <FloatingChatButton className="fixed bottom-6 right-6 z-40 hidden lg:block" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageBoundary resetKey={path}>{children}</PageBoundary>
      </main>
    </div>
  );
}
