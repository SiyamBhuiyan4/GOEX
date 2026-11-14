/*
  Where GOEX delivers. The map highlights these districts (zila) and the rest
  of Bangladesh stays grey.

  To add a district: add one entry below. `name` must match the district's name
  in geo-bangladesh.json (see place-names.ts for the spellings); `areas` are the
  places shown beside the map.
*/

export interface CoverageDistrict {
  name: string;
  division: string;
  areas: string[];
}

export const COVERAGE_DISTRICTS: CoverageDistrict[] = [
  {
    name: "Dhaka",
    division: "Dhaka",
    areas: ["Dhaka city", "Savar", "Dhamrai", "Keraniganj", "Nawabganj", "Dohar"],
  },
];
