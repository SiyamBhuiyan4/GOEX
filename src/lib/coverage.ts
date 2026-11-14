/*
  Where GOEX delivers. Add or remove a place here and the coverage map updates.
  lat/lng is the centre of the place; radiusM is roughly how much ground it covers.
  (OpenStreetMap has no exact boundaries for most Dhaka neighbourhoods, so each
  place is drawn as a circle around its centre.)
*/

export type CoverageCity = "Dhaka" | "Savar";

export interface CoveragePlace {
  name: string;
  city: CoverageCity;
  lat: number;
  lng: number;
  radiusM: number;
}

export const COVERAGE_PLACES: CoveragePlace[] = [
  // Dhaka
  { name: "Dhanmondi", city: "Dhaka", lat: 23.7465, lng: 90.376, radiusM: 1300 },
  { name: "Mohammadpur", city: "Dhaka", lat: 23.7662, lng: 90.3589, radiusM: 1500 },
  { name: "Mirpur", city: "Dhaka", lat: 23.8124, lng: 90.3641, radiusM: 2200 },
  { name: "Uttara", city: "Dhaka", lat: 23.8759, lng: 90.3795, radiusM: 2300 },
  { name: "Gulshan", city: "Dhaka", lat: 23.7922, lng: 90.4156, radiusM: 1200 },
  { name: "Banani", city: "Dhaka", lat: 23.7937, lng: 90.4005, radiusM: 900 },
  { name: "Badda", city: "Dhaka", lat: 23.7765, lng: 90.4463, radiusM: 1500 },
  { name: "Tejgaon", city: "Dhaka", lat: 23.7628, lng: 90.3913, radiusM: 1300 },
  { name: "Motijheel", city: "Dhaka", lat: 23.7273, lng: 90.4212, radiusM: 1200 },
  // Savar
  { name: "Savar Sadar", city: "Savar", lat: 23.8477, lng: 90.2587, radiusM: 2200 },
  { name: "Ashulia", city: "Savar", lat: 23.897, lng: 90.329, radiusM: 2500 },
  { name: "Hemayetpur", city: "Savar", lat: 23.7932, lng: 90.2714, radiusM: 1600 },
  { name: "Aminbazar", city: "Savar", lat: 23.7865, lng: 90.3302, radiusM: 1400 },
  { name: "Jahangirnagar", city: "Savar", lat: 23.8825, lng: 90.267, radiusM: 1400 },
  { name: "Nabinagar", city: "Savar", lat: 23.9165, lng: 90.2703, radiusM: 1300 },
  { name: "Baipayl", city: "Savar", lat: 23.938, lng: 90.2701, radiusM: 1200 },
  { name: "Dhamrai", city: "Savar", lat: 23.9183, lng: 90.2142, radiusM: 2000 },
];

export const COVERAGE_CITIES: CoverageCity[] = ["Dhaka", "Savar"];
