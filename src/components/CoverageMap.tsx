import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { CheckCircle2, MapPin } from "lucide-react";
import { COVERAGE_DISTRICTS } from "../lib/coverage";
import { PLACE_BN } from "../lib/place-names";
import { t, useLang, useTheme } from "../lib/prefs";
import { cx } from "./ui";

/*
  Coverage map of Bangladesh: the national border, the 8 divisions and 64
  districts are drawn from our own boundary data (lazy-loaded), so no other
  country appears. Covered districts are filled purple; zooming into one fades
  in street detail from OpenStreetMap.
  Boundaries: geoBoundaries (CC BY 3.0 IGO) — credited on the map.
*/

type Geom = { type: "Polygon"; coordinates: number[][][] } | { type: "MultiPolygon"; coordinates: number[][][][] };
type GeoData = {
  country: Geom;
  divisions: { name: string; geometry: Geom }[];
  districts: { name: string; geometry: Geom }[];
};

const PALETTE = {
  light: { bg: "#f5f6fa", land: "#e8eaf3", landLine: "#c3c9dc", hover: "#dcd3ef", divLine: "#7f88a6", border: "#1f0f36", label: "#59627f", cov: "#6b21a8" },
  dark: { bg: "#060d1c", land: "#14213a", landLine: "#2b3b61", hover: "#241a40", divLine: "#5d71a0", border: "#e9eef8", label: "#a8b3cb", cov: "#d8b4fe" },
};
const PAD = 14;
const COVERED = "#a855f7";

const polys = (g: Geom) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
const ringArea = (r: number[][]) => Math.abs(r.reduce((s, p, i) => (i < r.length - 1 ? s + p[0] * r[i + 1][1] - r[i + 1][0] * p[1] : s), 0)) / 2;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Label position: centre of the largest piece of the shape, as [lat, lng]. */
function centroid(g: Geom): [number, number] {
  const ring = polys(g).reduce((best, p) => (ringArea(p[0]) > ringArea(best[0]) ? p : best))[0];
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const f = ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    a += f;
    cx += (ring[i][0] + ring[i + 1][0]) * f;
    cy += (ring[i][1] + ring[i + 1][1]) * f;
  }
  return [cy / (3 * a), cx / (3 * a)];
}

export function CoverageMap() {
  const el = useRef<HTMLDivElement>(null);
  const goTo = useRef<((key: string, animate: boolean) => void) | null>(null);
  const [active, setActive] = useState("all");
  const activeRef = useRef(active);
  activeRef.current = active;
  const dark = useTheme() === "dark";
  const lang = useLang();
  const pn = (en: string) => (lang === "bn" ? (PLACE_BN[en] ?? en) : en);

  // Leaflet and the boundary data load only when the map scrolls near the screen.
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let cancelled = false;
    let map: LeafletMap | undefined;
    let resizer: ResizeObserver | undefined;
    const pal = PALETTE[dark ? "dark" : "light"];
    node.style.setProperty("--map-bg", pal.bg);
    node.style.setProperty("--map-label", pal.label);
    node.style.setProperty("--map-cov", pal.cov);

    const init = async () => {
      const [L, geoMod] = await Promise.all([
        import("leaflet").then((m) => m.default),
        import("../lib/geo-bangladesh.json"),
        import("leaflet/dist/leaflet.css"),
      ]);
      if (cancelled) return;
      const geo = (geoMod.default ?? geoMod) as unknown as GeoData;
      const shape = (g: Geom, o: Record<string, unknown>) => L.geoJSON({ type: "Feature", properties: {}, geometry: g } as never, o as never);

      const m = L.map(node, {
        minZoom: 0, // explicit, or Leaflet raises it to the street-tile layer's minZoom and the country can't fit
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        scrollWheelZoom: false, // don't hijack page scrolling
        dragging: !L.Browser.mobile, // one-finger page scroll keeps working on phones
        maxBoundsViscosity: 1,
      });
      map = m;
      m.attributionControl.addAttribution("Boundaries &copy; geoBoundaries");
      for (const [name, z] of [["districts", 410], ["divisions", 415], ["mask", 420], ["border", 430]] as const) m.createPane(name).style.zIndex = String(z);

      // Street detail: only appears once you zoom into a district (opaque grey districts hide it elsewhere).
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        minZoom: 8,
        maxZoom: 18,
        className: dark ? "goex-tiles goex-tiles-dark" : "goex-tiles",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m);

      // Districts
      const covered = new Set(COVERAGE_DISTRICTS.map((d) => d.name));
      const coveredLayers = new Map<string, ReturnType<typeof shape>>();
      for (const d of geo.districts) {
        const on = covered.has(d.name);
        const base = on
          ? { fillColor: COVERED, fillOpacity: 0.4, color: "#6b21a8", weight: 1.8 }
          : { fillColor: pal.land, fillOpacity: 1, color: pal.landLine, weight: 0.8 };
        const layer = shape(d.geometry, { pane: "districts", style: base });
        layer.bindTooltip(on ? `<b>${esc(pn(d.name))}</b><br>${esc(t("We deliver here"))}` : `<b>${esc(pn(d.name))}</b>`, { sticky: true, className: "goex-tip" });
        layer.on("mouseover", () => layer.setStyle(on ? { fillOpacity: 0.58 } : { fillColor: pal.hover }));
        layer.on("mouseout", () => layer.setStyle(base));
        layer.on("click", () => on && setActive(d.name));
        layer.addTo(m);
        if (on) coveredLayers.set(d.name, layer);
      }
      coveredLayers.forEach((l) => l.bringToFront());

      // Division borders, national border (strong, with a soft glow)
      shape({ type: "MultiPolygon", coordinates: geo.divisions.flatMap((d) => polys(d.geometry)) }, { pane: "divisions", interactive: false, style: { color: pal.divLine, weight: 1.5, fill: false } }).addTo(m);
      const holes = polys(geo.country).map((p) => p[0].map(([x, y]) => [y, x]));
      L.polygon([[[-85, -180], [-85, 180], [85, 180], [85, -180]], ...holes] as never, { pane: "mask", stroke: false, fillColor: pal.bg, fillOpacity: 1, interactive: false }).addTo(m);
      shape(geo.country, { pane: "border", interactive: false, style: { color: "#6b21a8", weight: 9, opacity: 0.16, fill: false, lineJoin: "round" } }).addTo(m);
      shape(geo.country, { pane: "border", interactive: false, style: { color: pal.border, weight: 2.6, fill: false, lineJoin: "round" } }).addTo(m);

      // Labels: divisions when zoomed out, districts when zoomed in; covered districts always.
      const label = (cls: string, text: string, g: Geom) =>
        L.marker(centroid(g), { icon: L.divIcon({ className: `goex-lbl ${cls}`, html: `<span>${esc(text)}</span>`, iconSize: [0, 0] }), interactive: false, keyboard: false }).addTo(m);
      // A division whose covered district has the same name (Dhaka) shows only the district label.
      for (const d of geo.divisions) if (!COVERAGE_DISTRICTS.some((c) => c.name === d.name && c.division === d.name)) label("goex-lbl-v", pn(d.name), d.geometry);
      for (const d of geo.districts) label(covered.has(d.name) ? "goex-lbl-c" : "goex-lbl-d", pn(d.name), d.geometry);

      // View: fit the country (or the chosen district) and never let the map zoom out past it.
      const countryBounds = shape(geo.country, {}).getBounds();
      const boundsOf = (key: string) => (key === "all" ? countryBounds : (coveredLayers.get(key)?.getBounds() ?? countryBounds));
      const syncLabels = () => node.classList.toggle("goex-show-d", m.getZoom() >= m.getMinZoom() + 1.25);
      const setLimits = () => {
        m.setMinZoom(m.getBoundsZoom(countryBounds, false, L.point(PAD * 2, PAD * 2)));
        m.setMaxBounds(countryBounds.pad(0.18));
      };
      const fit = (key: string, animate: boolean) => {
        const opts = { padding: [PAD, PAD] as [number, number] };
        if (animate) m.flyToBounds(boundsOf(key), { ...opts, duration: 0.8 });
        else m.fitBounds(boundsOf(key), { ...opts, animate: false });
      };
      m.fitBounds(countryBounds, { padding: [PAD, PAD], animate: false });
      setLimits();
      fit(activeRef.current, false);
      syncLabels();
      m.on("zoomend", syncLabels);
      goTo.current = fit;

      // Keep the fit correct when the box changes size (rotation, window resize, late layout).
      resizer = new ResizeObserver(() => {
        m.invalidateSize();
        setLimits();
        fit(activeRef.current, false);
        syncLabels();
      });
      resizer.observe(node);
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
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      resizer?.disconnect();
      goTo.current = null;
      map?.remove();
    };
  }, [dark, lang]);

  useEffect(() => {
    goTo.current?.(active, true);
  }, [active]);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-14">
      {/* Info */}
      <div className="order-2 lg:order-1">
        <div className="flex flex-wrap gap-2">
          {["all", ...COVERAGE_DISTRICTS.map((d) => d.name)].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setActive(k)}
              className={cx(
                "rounded-full px-4 py-2 text-sm font-bold transition",
                active === k ? "bg-brand text-white shadow-md shadow-brand/25" : "bg-surface text-ink-2 ring-1 ring-line hover:text-brand",
              )}
            >
              {k === "all" ? t("All Bangladesh") : `${pn(k)} ${t("District")}`}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {COVERAGE_DISTRICTS.map((d) => (
            <div key={d.name} className="rounded-3xl bg-surface p-6 ring-1 ring-line">
              <p className="flex items-center gap-2 text-lg font-extrabold">
                <MapPin className="size-5 text-brand" /> {pn(d.name)} {t("District")}
              </p>
              <p className="mt-0.5 text-sm text-ink-3">
                {pn(d.division)} {t("Division")}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {d.areas.map((a) => (
                  <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
                    <CheckCircle2 className="size-3.5" /> {t(a)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded-sm bg-[#a855f7]/60 ring-1 ring-brand" /> {t("We deliver here")}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded-sm bg-[#e8eaf3] ring-1 ring-line dark:bg-[#14213a]" /> {t("Not covered yet")}
          </li>
        </ul>
      </div>

      {/* Map: Bangladesh is taller than wide, so the box is too */}
      <div
        ref={el}
        role="region"
        aria-label={t("Coverage map")}
        className="goex-map relative z-0 order-1 mx-auto h-[460px] w-full max-w-[520px] overflow-hidden rounded-3xl bg-[var(--map-bg,#f5f6fa)] ring-1 ring-line sm:h-[560px] lg:order-2 lg:h-[620px]"
      />
    </div>
  );
}
