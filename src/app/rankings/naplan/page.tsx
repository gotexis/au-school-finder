import Link from "next/link";
import type { Metadata } from "next";
import naplanData from "@/data/naplan-rankings.json";

export const metadata: Metadata = {
  title: "NAPLAN School Rankings 2025 — Top Schools by NAPLAN Score | AU School Finder",
  description:
    "Ranking of 780+ Australian schools by NAPLAN results. Filter by state, level, and sector. See which schools achieve the highest NAPLAN scores.",
};

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600 bg-emerald-50";
  if (score >= 75) return "text-green-600 bg-green-50";
  if (score >= 60) return "text-yellow-600 bg-yellow-50";
  if (score >= 45) return "text-orange-500 bg-orange-50";
  return "text-red-500 bg-red-50";
}

function getScoreGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B+";
  if (score >= 65) return "B";
  if (score >= 55) return "C+";
  if (score >= 45) return "C";
  return "D";
}

function getStarsDisplay(stars: number): string {
  if (stars >= 90) return "⭐⭐⭐⭐⭐";
  if (stars >= 75) return "⭐⭐⭐⭐";
  if (stars >= 60) return "⭐⭐⭐";
  if (stars >= 45) return "⭐⭐";
  return "⭐";
}

interface NaplanSchool {
  name: string;
  suburb: string;
  state: string;
  postcode: string;
  level: string;
  naplan_score: number;
  improvement_pct: number;
  students: number | null;
  sector: string;
  stars: number;
}

const STATE_LABELS: Record<string, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory",
};

export default async function NaplanRankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; level?: string; sector?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const selectedState = params.state || "all";
  const selectedLevel = params.level || "all";
  const selectedSector = params.sector || "all";
  const sortBy = params.sort || "score";

  let schools = [...(naplanData as unknown as NaplanSchool[])];

  if (selectedState !== "all") schools = schools.filter((s) => s.state === selectedState);
  if (selectedLevel !== "all") schools = schools.filter((s) => s.level === selectedLevel);
  if (selectedSector !== "all") schools = schools.filter((s) => s.sector === selectedSector);

  schools.sort((a, b) => {
    if (sortBy === "improvement") return b.improvement_pct - a.improvement_pct;
    if (sortBy === "stars") return b.stars - a.stars;
    if (sortBy === "students") return (b.students || 0) - (a.students || 0);
    return b.naplan_score - a.naplan_score;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const states = [...new Set(naplanData.map((s: any) => s.state as string))].sort();
  const levels = [...new Set(naplanData.map((s: any) => s.level as string))].sort();
  const sectors = [...new Set(naplanData.map((s: any) => s.sector as string))].sort();

  function buildUrl(overrides: Record<string, string>) {
    const p = { state: selectedState, level: selectedLevel, sector: selectedSector, sort: sortBy, ...overrides };
    const qs = Object.entries(p).filter(([, v]) => v !== "all").map(([k, v]) => `${k}=${v}`).join("&");
    return `/rankings/naplan${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white/70 hover:text-white text-sm">Home</Link>
            <span className="text-white/50">/</span>
            <Link href="/rankings" className="text-white/70 hover:text-white text-sm">ICSEA Rankings</Link>
            <span className="text-white/50">/</span>
            <span className="text-sm">NAPLAN Rankings</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">📊 NAPLAN School Rankings 2025</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Top {schools.length} Australian schools ranked by NAPLAN results across all states and territories.
            Filter by state, school level, and sector.
          </p>
          <div className="flex gap-4 mt-4 text-sm text-white/60">
            <span>📊 Source: MySchool NAPLAN Data 2025</span>
            <span>🏫 {naplanData.length} schools total</span>
            <span className="bg-white/20 px-2 py-0.5 rounded">Beta: Sample of top schools per state/level</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {/* State filter */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
              🗺️ {selectedState === "all" ? "All States" : selectedState}
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link href={buildUrl({ state: "all" })}>All States</Link></li>
              {states.map((s) => (
                <li key={s}><Link href={buildUrl({ state: s })}>{s} — {STATE_LABELS[s] || s}</Link></li>
              ))}
            </ul>
          </div>

          {/* Level filter */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
              🎓 {selectedLevel === "all" ? "All Levels" : selectedLevel}
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
              <li><Link href={buildUrl({ level: "all" })}>All Levels</Link></li>
              {levels.map((l) => (
                <li key={l}><Link href={buildUrl({ level: l })}>{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Sector filter */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
              🏛️ {selectedSector === "all" ? "All Sectors" : selectedSector}
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link href={buildUrl({ sector: "all" })}>All Sectors</Link></li>
              {sectors.map((s) => (
                <li key={s}><Link href={buildUrl({ sector: s })}>{s}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sort buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link href={buildUrl({ sort: "score" })} className={`btn btn-sm ${sortBy === "score" ? "btn-primary" : "btn-ghost"}`}>
            📈 By NAPLAN Score
          </Link>
          <Link href={buildUrl({ sort: "improvement" })} className={`btn btn-sm ${sortBy === "improvement" ? "btn-primary" : "btn-ghost"}`}>
            📈 By Improvement %
          </Link>
          <Link href={buildUrl({ sort: "stars" })} className={`btn btn-sm ${sortBy === "stars" ? "btn-primary" : "btn-ghost"}`}>
            ⭐ By Star Rating
          </Link>
          <Link href={buildUrl({ sort: "students" })} className={`btn btn-sm ${sortBy === "students" ? "btn-primary" : "btn-ghost"}`}>
            👥 By Student Count
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg">
          <table className="table table-sm">
            <thead className="bg-base-200">
              <tr>
                <th className="w-12">#</th>
                <th>School</th>
                <th className="text-center">NAPLAN Score</th>
                <th className="text-center">Grade</th>
                <th className="text-center">Stars</th>
                <th className="text-center">Improvement</th>
                <th className="text-center">Students</th>
                <th className="text-center">Level</th>
                <th className="text-center">Sector</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school, i) => (
                <tr key={`${school.name}-${school.state}-${i}`} className="hover">
                  <td className="font-mono text-base-content/50">{i + 1}</td>
                  <td>
                    <span className="font-medium">{school.name}</span>
                    <div className="text-xs text-base-content/50">
                      {school.suburb}, {school.state} {school.postcode}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`font-bold text-lg px-2 py-1 rounded ${getScoreColor(school.naplan_score)}`}>
                      {school.naplan_score}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge badge-sm font-bold ${getScoreColor(school.naplan_score)}`}>
                      {getScoreGrade(school.naplan_score)}
                    </span>
                  </td>
                  <td className="text-center text-xs">
                    {getStarsDisplay(school.stars)}
                  </td>
                  <td className="text-center">
                    <span className={school.improvement_pct > 0 ? "text-emerald-600" : school.improvement_pct < 0 ? "text-red-500" : ""}>
                      {school.improvement_pct > 0 ? "+" : ""}{school.improvement_pct}%
                    </span>
                  </td>
                  <td className="text-center">{school.students ?? "—"}</td>
                  <td className="text-center">
                    <span className="badge badge-ghost badge-sm">{school.level}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-ghost badge-sm">{school.sector}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Data source note */}
        <div className="mt-8 p-4 bg-base-100 rounded-lg text-sm text-base-content/60">
          <h3 className="font-semibold mb-2">📋 About this data</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Source: MySchool.edu.au NAPLAN results 2025</li>
            <li>NAPLAN score is a percentile ranking (0-100) based on results across Reading, Writing, Numeracy, Spelling, Grammar</li>
            <li>Improvement % shows year-on-year change in NAPLAN performance</li>
            <li>Star rating (0-100) is an overall quality indicator combining NAPLAN results and improvement</li>
            <li>
              <span className="bg-yellow-100 text-yellow-800 px-1 rounded">Beta:</span> Currently showing {naplanData.length} top schools per state/level combination.
              Full dataset (10,000+ schools) coming soon.
            </li>
            <li>For ICSEA-based rankings of all 9,700+ schools, see{" "}
              <Link href="/rankings" className="link link-primary">ICSEA Rankings</Link>
            </li>
            <li>For VCE results (Victoria), see{" "}
              <Link href="/rankings/vce" className="link link-primary">VCE Rankings</Link>
            </li>
            <li>For HSC results (NSW), see{" "}
              <Link href="/rankings/hsc" className="link link-primary">HSC Rankings</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
