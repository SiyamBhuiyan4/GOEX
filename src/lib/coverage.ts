import type { Feature, Polygon, MultiPolygon } from "geojson";
import dhaka from "./districts/dhaka.json";

/*
  Districts (zila) GOEX delivers in. Each one is drawn on the coverage map with
  its real boundary from OpenStreetMap.

  To add a district: save its boundary GeoJSON in ./districts/ (Nominatim lookup
  of the district's OSM relation with polygon_geojson=1), import it here and add
  an entry below.
*/

export interface CoverageDistrict {
  name: string;
  shape: Feature<Polygon | MultiPolygon>;
}

export const COVERAGE_DISTRICTS: CoverageDistrict[] = [
  { name: "Dhaka", shape: dhaka as Feature<Polygon> },
];
