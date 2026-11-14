import { useEffect, useRef, useState } from "react";
import type { Circle, LatLngBounds, Map as LeafletMap } from "leaflet";
import { COVERAGE_CITIES, COVERAGE_PLACES, type CoverageCity } from "../lib/coverage";
import { t, useLang, useTheme } from "../lib/prefs";
import { cx } from "./ui";

const BRAND = "#6b21a8";

/** Interactive map: every covered place is highlighted; city buttons zoom to Dhaka or Savar. */
export function CoverageMap() {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const circles = useRef<Circle[]>([]);
  const boundsFor = useRef<((c: CoverageCity | "all") => LatLngBounds) | null>(null);
  const [city, setCity] = useState<CoverageCity | "all">("all");
  const [ready, setReady] = useState(false);
  const dark = useTheme() === "dark";
  const lang = useLang();

  // Leaflet is loaded only when the map is on screen, so it doesn't slow the first paint.
  useEffect(() => {
    if (!el.current) return;
    let cancelled = false;
    let observer: IntersectionObserver | undefined;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !el.current || map.current) return;

      const m = L.map(el.current, {
        zoomControl: true,
        scrollWheelZoom: false, // don't hijack page scrolling
        dragging: !L.Browser.mobile, // one-finger page scroll keeps working on phones
        attributionControl: true,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        className: dark ? "goex-tiles goex-tiles-dark" : "goex-tiles",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m);

      // Bounds come straight from centre + radius, so they work before the map has a view.
      boundsFor.current = (c) =>
        L.latLngBounds(
          COVERAGE_PLACES.filter((p) => c === "all" || p.city === c).flatMap((p) => {
            const b = L.latLng(p.lat, p.lng).toBounds(p.radiusM * 2);
            return [b.getSouthWest(), b.getNorthEast()];
          }),
        );
      m.fitBounds(boundsFor.current("all"), { padding: [24, 24] });

      circles.current = COVERAGE_PLACES.map((p) =>
        L.circle([p.lat, p.lng], {
          radius: p.radiusM,
          color: BRAND,
          weight: 2,
          fillColor: "#a855f7",
          fillOpacity: 0.28,
        })
          .bindTooltip(`<b>${t(p.name)}</b><br/>${t(p.city)}`, { direction: "top", className: "goex-tip" })
          .addTo(m),
      );
      map.current = m;
      setReady(true);
      setCity("all");
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer?.disconnect();
          void init();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el.current);

    return () => {
      cancelled = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
      setReady(false);
    };
  }, [dark, lang]);

  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    const bounds = boundsFor.current?.(city);
    if (!bounds) return;
    // Fade the other city's areas so the chosen city stands out.
    COVERAGE_PLACES.forEach((p, i) => {
      const on = city === "all" || p.city === city;
      circles.current[i]?.setStyle({ opacity: on ? 1 : 0.25, fillOpacity: on ? 0.28 : 0.06 });
    });
    m.flyToBounds(bounds, { padding: [24, 24], duration: 0.8 });
  }, [city, ready]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {(["all", ...COVERAGE_CITIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCity(c)}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-bold transition",
              city === c ? "bg-brand text-white shadow-md shadow-brand/25" : "bg-surface text-ink-2 ring-1 ring-line hover:text-brand",
            )}
          >
            {c === "all" ? t("All") : t(c)}
          </button>
        ))}
      </div>
      <div
        ref={el}
        role="region"
        aria-label={t("Coverage map")}
        className="relative z-0 h-[420px] w-full overflow-hidden rounded-3xl bg-page ring-1 ring-line sm:h-[480px]"
      />
      <p className="mt-3 text-center text-xs text-ink-3">{t("Highlighted areas are where we deliver. Tap an area to see its name.")}</p>
    </div>
  );
}
