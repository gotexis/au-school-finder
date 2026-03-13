import Link from "next/link";
import { getSchools, STATE_NAMES } from "@/lib/schools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Australian School Rankings by ICSEA — AU School Finder",
  description: "Rankings of 9,700+ Australian schools by ICSEA score. Filter by state, sector, and school type.",
};

function getIcseaGrade(icsea: number): { grade: string; color: string } {
  if (icsea >= 1150) return { grade: "A+", color: "text-emerald-600" };
  if (icsea >= 1100) return { grade: "A", color: "text-emerald-500" };
  if (icsea >= 1050) return { grade: "B+", color: "text-green-500" };
  if (icsea >= 1000) return { grade: "B", color: "text-lime-600" };
  if (icsea >= 950) return { grade: "C+", color: "text-yellow-600" };
  if (icsea >= 900) return { grade: "C", color: "text-orange-400" };
  return { grade: "D", color: "text-red-400" };
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; sector?: string; type?: string }>;
}) {
  const params = await searchParams;
  const selectedState = params.state || "all";
  const selectedSector = params.sector || "all";
  const selectedType = params.type || "all";

  let schools = getSchools().filter((s) => s.icsea);

  if (selectedState !== "all") schools = schools.filter((s) => s.state === selectedState);
  if (selectedSector !== "all") schools = schools.filter((s) => s.sector === selectedSector);
  if (selectedType !== "all") schools = schools.filter((s) => s.type === selectedType);

  schools.sort((a, b) => (b.icsea || 0) - (a.icsea || 0));

  const states = Object.keys(STATE_NAMES).sort();
  const sectors = ["Government", "Catholic", "Independent"];
  const types = ["Primary", "Secondary", "Combined", "Special"];

  function buildUrl(overrides: Record<string, string>) {
    const p = { state: selectedState, sector: selectedSector, type: selectedType, ...overrides };
    const qs = Object.entries(p).filter(([, v]) => v !== "all").map(([k, v]) => `${k}=${v}`).join("&");
    return `/rankings${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏆 School Rankings</h1>
        <p className="text-base-content/70">
          Ranked by ICSEA (Index of Community Socio-Educational Advantage). Showing {schools.length.toLocaleString()} schools.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6 p-5 bg-base-200 rounded-2xl">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 block">State</label>
          <div className="flex flex-wrap gap-1">
            <Link href={buildUrl({ state: "all" })} className={`btn btn-xs ${selectedState === "all" ? "btn-primary" : "btn-ghost"}`}>All</Link>
            {states.map((s) => (
              <Link key={s} href={buildUrl({ state: s })}
                className={`btn btn-xs ${selectedState === s ? "btn-primary" : "btn-ghost"}`}>{s}</Link>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 block">Sector</label>
          <div className="flex flex-wrap gap-1">
            <Link href={buildUrl({ sector: "all" })} className={`btn btn-xs ${selectedSector === "all" ? "btn-secondary" : "btn-ghost"}`}>All</Link>
            {sectors.map((s) => (
              <Link key={s} href={buildUrl({ sector: s })}
                className={`btn btn-xs ${selectedSector === s ? "btn-secondary" : "btn-ghost"}`}>{s}</Link>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 block">Type</label>
          <div className="flex flex-wrap gap-1">
            <Link href={buildUrl({ type: "all" })} className={`btn btn-xs ${selectedType === "all" ? "btn-accent" : "btn-ghost"}`}>All</Link>
            {types.map((t) => (
              <Link key={t} href={buildUrl({ type: t })}
                className={`btn btn-xs ${selectedType === t ? "btn-accent" : "btn-ghost"}`}>{t}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="overflow-x-auto rounded-2xl border border-base-200">
        <table className="table">
          <thead>
            <tr className="bg-base-200">
              <th className="w-16">#</th>
              <th>School</th>
              <th className="hidden md:table-cell">Location</th>
              <th className="w-20">Type</th>
              <th className="w-16 text-center">Grade</th>
              <th className="w-20 text-right">ICSEA</th>
              <th className="w-48 hidden lg:table-cell">Score</th>
              <th className="w-28 text-right hidden sm:table-cell">Students</th>
            </tr>
          </thead>
          <tbody>
            {schools.slice(0, 200).map((s, i) => {
              const { grade, color } = getIcseaGrade(s.icsea!);
              const barWidth = Math.min(100, Math.max(0, ((s.icsea! - 700) / 700) * 100));
              return (
                <tr key={s.id} className="hover">
                  <td className="font-mono text-base-content/40 text-sm">{i + 1}</td>
                  <td>
                    <Link href={`/school/${s.slug}`} className="font-semibold hover:text-primary transition-colors">
                      {s.name}
                    </Link>
                    <div className="text-xs text-base-content/50 md:hidden">{s.suburb}, {s.state}</div>
                    <div className="text-xs text-base-content/50">{s.sector}</div>
                  </td>
                  <td className="hidden md:table-cell text-sm">{s.suburb}, {s.state}</td>
                  <td><span className="badge badge-sm badge-outline">{s.type}</span></td>
                  <td className="text-center">
                    <span className={`font-extrabold text-lg ${color}`}>{grade}</span>
                  </td>
                  <td className="text-right font-mono font-bold">{s.icsea}</td>
                  <td className="hidden lg:table-cell">
                    <div className="w-full bg-base-300 rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: `${barWidth}%` }} />
                    </div>
                  </td>
                  <td className="text-right text-sm hidden sm:table-cell">{s.enrolments.total?.toLocaleString() || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {schools.length > 200 && (
        <div className="text-center mt-4 text-sm text-base-content/50">
          Showing top 200 of {schools.length.toLocaleString()} schools
        </div>
      )}
    </div>
  );
}
