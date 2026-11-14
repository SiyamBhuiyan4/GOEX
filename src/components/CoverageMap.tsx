import { useEffect, useRef, useState } from "react";
import type { GeoJSON as GeoJSONLayer, Map as LeafletMap } from "leaflet";
import type { Position } from "geojson";
import { COVERAGE_DISTRICTS } from "../lib/coverage";
import { t, useLang, useTheme } from "../lib/prefs";
import { cx } from "./ui";

const BRAND = "#6b21a8";

/** Outer rings of a district shape, as Leaflet [lat, lng] lists. */
function outerRings(d: (typeof COVERAGE_DISTRICTS)[number]): [number, number][][] {
  const g = d.shape.geometry;
  const polys: Position[][][] = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  return polys.map((poly) => poly[0].map(([lng, lat]) => [lat, lng] as [number, number]));
}

/** Coverage map: each district we serve is drawn with its real boundary; the rest of the map is faded. */
export function CoverageMap() {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layers = useRef<GeoJSONLayer[]>([]);
  const [active, setActive] = useState<string>("all");
  const [ready, setReady] = useState(false);
  const dark = useTheme() === "dark";
  const lang = useLang();

  // Leaflet loads only when the map scrolls near the screen.
  useEffect(() => {
    if (!el.current) return;
    let cancelled = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !el.current || map.current) return;

      const m = L.map(el.current, {
        scrollWheelZoom: false, // don't hijack page scrolling
        dragging: !L.Browser.mobile, // one-finger page scroll keeps working on phones
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        className: dark ? "goex-tiles goex-tiles-dark" : "goex-tiles",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m);

      // Fade everything outside our districts: a world-sized polygon with the districts cut out.
      const world: [number, number][] = [
        [-85, -180],
        [-85, 180],
        [85, 180],
        [85, -180],
      ];
      L.polygon([world, ...COVERAGE_DISTRICTS.flatMap(outerRings)], {
        stroke: false,
        fillColor: dark ? "#0b0614" : "#ffffff",
        fillOpacity: dark ? 0.55 : 0.6,
        interactive: false,
      }).addTo(m);

      layers.current = COVERAGE_DISTRICTS.map((d) =>
        L.geoJSON(d.shape, {
          style: { color: BRAND, weight: 3, fillColor: "#a855f7", fillOpacity: 0.16 },
        })
          .bindTooltip(`<b>${t(d.name)}</b> · ${t("District")}`, { sticky: true, className: "goex-tip" })
          .addTo(m),
      );

      m.fitBounds(L.featureGroup(layers.current).getBounds(), { padding: [20, 20] });
      map.current = m;
      setActive("all");
      setReady(true);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void init();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el.current);

    return () => {
      cancelled = true;
      observer.disconnect();
      map.current?.remove();
      map.current = null;
      setReady(false);
    };
  }, [dark, lang]);

  // District buttons: zoom to one district and highlight it.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    const shown = layers.current.filter((_, i) => active === "all" || COVERAGE_DISTRICTS[i].name === active);
    layers.current.forEach((l, i) => {
      const on = active === "all" || COVERAGE_DISTRICTS[i].name === active;
      l.setStyle({ opacity: on ? 1 : 0.35, fillOpacity: on ? 0.16 : 0.04 });
    });
    let b = shown[0].getBounds();
    for (const l of shown) b = b.extend(l.getBounds());
    m.flyToBounds(b, { padding: [20, 20], duration: 0.8 });
  }, [active, ready]);

  return (
    <div>
      {COVERAGE_DISTRICTS.length > 1 && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {["all", ...COVERAGE_DISTRICTS.map((d) => d.name)].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={cx(
                "rounded-full px-4 py-2 text-sm font-bold transition",
                active === c ? "bg-brand text-white shadow-md shadow-brand/25" : "bg-surface text-ink-2 ring-1 ring-line hover:text-brand",
              )}
            >
              {c === "all" ? t("All") : t(c)}
            </button>
          ))}
        </div>
      )}
      <div
        ref={el}
        role="region"
        aria-label={t("Coverage map")}
        className="relative z-0 h-[440px] w-full overflow-hidden rounded-3xl bg-page ring-1 ring-line sm:h-[520px]"
      />
      <p className="mt-3 text-center text-sm text-ink-2">
        {t("We deliver across the whole of:")}{" "}
        <span className="font-bold text-ink">{COVERAGE_DISTRICTS.map((d) => `${t(d.name)} ${t("District")}`).join(", ")}</span>
      </p>
    </div>
  );
}
