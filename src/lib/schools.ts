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
