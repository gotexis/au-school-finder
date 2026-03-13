import fs from "fs";
import path from "path";

export interface School {
  id: number;
  slug: string;
  name: string;
  suburb: string;
  state: string;
  postcode: string;
  sector: string;
  type: string;
  yearRange: string;
  url: string;
  governingBody: string;
  geolocation: string;
  icsea: number | null;
  icseaPercentile: number | null;
  seaQuarters: {
    bottom: number | null;
    lowerMiddle: number | null;
    upperMiddle: number | null;
    top: number | null;
  };
  staff: {
    teaching: number | null;
    teachingFTE: number | null;
    nonTeaching: number | null;
    nonTeachingFTE: number | null;
  };
  enrolments: {
    total: number | null;
    girls: number | null;
    boys: number | null;
    fte: number | null;
    indigenous: number | null;
    lbote: number | null;
  };
  latitude: number | null;
  longitude: number | null;
  lga: string;
  sa4: string;
  gradeEnrolments: Record<string, number | null>;
}

const dataDir = path.join(process.cwd(), "src", "data");

let _schools: School[] | null = null;

export function getSchools(): School[] {
  if (!_schools) {
    const raw = fs.readFileSync(path.join(dataDir, "schools.json"), "utf-8");
    _schools = JSON.parse(raw);
  }
  return _schools!;
}

export function getSchoolBySlug(slug: string): School | undefined {
  return getSchools().find((s) => s.slug === slug);
}

export function getStates(): Record<string, { count: number; suburbs: number }> {
  const raw = fs.readFileSync(path.join(dataDir, "states.json"), "utf-8");
  return JSON.parse(raw);
}

export function getSuburbs(): Record<
  string,
  { name: string; state: string; postcode: string; count: number }
> {
  const raw = fs.readFileSync(path.join(dataDir, "suburbs.json"), "utf-8");
  return JSON.parse(raw);
}

export function getSchoolsByState(state: string): School[] {
  return getSchools().filter((s) => s.state === state);
}

export function getSchoolsBySuburb(suburb: string, state: string): School[] {
  return getSchools().filter(
    (s) =>
      s.suburb.toLowerCase() === suburb.toLowerCase() && s.state === state
  );
}

/**
 * Find nearby schools using Haversine distance.
 * Returns up to `limit` schools within `radiusKm`, sorted by distance.
 */
export function getNearbySchools(
  lat: number,
  lng: number,
  excludeSlug: string,
  radiusKm: number = 5,
  limit: number = 10
): (School & { distanceKm: number })[] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  return getSchools()
    .filter((s) => s.slug !== excludeSlug && s.latitude && s.longitude)
    .map((s) => {
      const dLat = toRad(s.latitude! - lat);
      const dLon = toRad(s.longitude! - lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) * Math.cos(toRad(s.latitude!)) * Math.sin(dLon / 2) ** 2;
      const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...s, distanceKm };
    })
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export const STATE_NAMES: Record<string, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
  ACT: "Australian Capital Territory",
};
