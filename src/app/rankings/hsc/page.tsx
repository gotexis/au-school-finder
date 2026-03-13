import Link from "next/link";
import type { Metadata } from "next";
import hscData from "@/data/hsc-rankings.json";

export const metadata: Metadata = {
  title: "HSC School Rankings 2025 — Top NSW Schools | AU School Finder",
  description:
    "Ranking of 200+ NSW schools by HSC results. Compare % of Distinguished Achievers (Band 5-6), student numbers, and school categories.",
};

function getPctColor(pct: number): string {
  if (pct >= 60) return "text-emerald-600 bg-emerald-50";
  if (pct >= 45) return "text-green-600 bg-green-50";
  if (pct >= 30) return "text-yellow-600 bg-yellow-50";
  if (pct >= 15) return "text-orange-500 bg-orange-50";
  return "text-red-500 bg-red-50";
}

function getCategoryBadge(cat: string): string {
  if (cat.includes("selective")) return "badge-primary";
  if (cat.includes("Non-government") || cat.includes("Independent"))
    return "badge-secondary";
  if (cat.includes("Catholic")) return "badge-accent";
  return "badge-ghost";
}

interface HscSchool {
  rank: number;
  name: string;
  pctTopBands: string;
  students: string;
  examsSat: string;
  distinguishedAchievers: string;
  category: string;
  region: string;
  suburb: string;
  state: string;
  postcode: string;
}

export default async function HscRankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; cat?: string }>;
}) {
  const params = await searchParams;
  const sortBy = params.sort || "rank";
  const catFilter = params.cat || "all";

  let schools = [...(hscData as unknown as HscSchool[])];

  // Filter by category
  if (catFilter !== "all") {
    schools = schools.filter((s) =>
      s.category.toLowerCase().includes(catFilter.toLowerCase())
    );
  }

  // Sort
  if (sortBy === "pct") {
    schools.sort(
      (a, b) => parseFloat(b.pctTopBands) - parseFloat(a.pctTopBands)
    );
  } else if (sortBy === "students") {
    schools.sort(
      (a, b) => parseInt(b.students || "0") - parseInt(a.students || "0")
    );
  } else if (sortBy === "da") {
    schools.sort(
      (a, b) =>
        parseInt(b.distinguishedAchievers || "0") -
        parseInt(a.distinguishedAchievers || "0")
    );
  }

  const categories = [
    ...new Set(hscData.map((s: HscSchool) => s.category)),
  ].sort();

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-cyan-700 to-teal-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white/70 hover:text-white text-sm">
              Home
            </Link>
            <span className="text-white/50">/</span>
            <Link
              href="/rankings"
              className="text-white/70 hover:text-white text-sm"
            >
              Rankings
            </Link>
            <span className="text-white/50">/</span>
            <span className="text-sm">HSC Rankings</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            🏆 HSC School Rankings 2025
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            {schools.length} NSW schools ranked by HSC performance. Compare
            Distinguished Achiever rates, student numbers, and results across
            government, selective, Catholic, and independent schools.
          </p>
          <div className="flex gap-4 mt-4 text-sm text-white/60">
            <span>📊 Source: BetterEducation / NESA HSC Results</span>
            <span>🔄 Updated: January 2026</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/rankings/hsc?sort=rank"
              className={`btn btn-sm ${sortBy === "rank" ? "btn-primary" : "btn-ghost"}`}
            >
              🏅 By Rank
            </Link>
            <Link
              href="/rankings/hsc?sort=pct"
              className={`btn btn-sm ${sortBy === "pct" ? "btn-primary" : "btn-ghost"}`}
            >
              📈 By % Top Bands
            </Link>
            <Link
              href="/rankings/hsc?sort=da"
              className={`btn btn-sm ${sortBy === "da" ? "btn-primary" : "btn-ghost"}`}
            >
              ⭐ By DA Count
            </Link>
            <Link
              href="/rankings/hsc?sort=students"
              className={`btn btn-sm ${sortBy === "students" ? "btn-primary" : "btn-ghost"}`}
            >
              👥 By Student Count
            </Link>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/rankings/hsc"
              className={`btn btn-sm ${catFilter === "all" ? "btn-secondary" : "btn-ghost"}`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/rankings/hsc?cat=${encodeURIComponent(cat)}`}
                className={`btn btn-sm ${catFilter === cat ? "btn-secondary" : "btn-ghost"}`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-100 rounded-lg shadow p-4">
            <div className="stat-title text-xs">Total Schools</div>
            <div className="stat-value text-2xl">{schools.length}</div>
          </div>
          <div className="stat bg-base-100 rounded-lg shadow p-4">
            <div className="stat-title text-xs">Avg % Top Bands</div>
            <div className="stat-value text-2xl">
              {(
                schools.reduce(
                  (sum, s) => sum + parseFloat(s.pctTopBands || "0"),
                  0
                ) / schools.length
              ).toFixed(1)}
              %
            </div>
          </div>
          <div className="stat bg-base-100 rounded-lg shadow p-4">
            <div className="stat-title text-xs">Total DA Awards</div>
            <div className="stat-value text-2xl">
              {schools
                .reduce(
                  (sum, s) => sum + parseInt(s.distinguishedAchievers || "0"),
                  0
                )
                .toLocaleString()}
            </div>
          </div>
          <div className="stat bg-base-100 rounded-lg shadow p-4">
            <div className="stat-title text-xs">Top School</div>
            <div className="stat-value text-lg truncate">
              {schools[0]?.name}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg">
          <table className="table table-sm">
            <thead className="bg-base-200">
              <tr>
                <th className="w-12">#</th>
                <th>School</th>
                <th className="text-center">% Top Bands</th>
                <th className="text-center">Students</th>
                <th className="text-center">Exams Sat</th>
                <th className="text-center">DA Count</th>
                <th className="text-center">Category</th>
                <th className="text-center">Region</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school, i) => (
                <tr key={`${school.name}-${i}`} className="hover">
                  <td className="font-mono text-base-content/50">
                    {school.rank}
                  </td>
                  <td>
                    <span className="font-medium">{school.name}</span>
                    <div className="text-xs text-base-content/50">
                      {school.suburb}
                      {school.postcode ? `, ${school.postcode}` : ""}
                    </div>
                  </td>
                  <td className="text-center">
                    <span
                      className={`font-bold text-lg px-2 py-1 rounded ${getPctColor(parseFloat(school.pctTopBands))}`}
                    >
                      {school.pctTopBands}%
                    </span>
                  </td>
                  <td className="text-center">{school.students}</td>
                  <td className="text-center">{school.examsSat}</td>
                  <td className="text-center font-medium">
                    {school.distinguishedAchievers}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge badge-sm ${getCategoryBadge(school.category)}`}
                    >
                      {school.category}
                    </span>
                  </td>
                  <td className="text-center text-sm">
                    {school.region}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Data note */}
        <div className="mt-8 p-4 bg-base-100 rounded-lg text-sm text-base-content/60">
          <h3 className="font-semibold mb-2">📋 About this data</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Source: BetterEducation compilation of NESA HSC results (schools
              with 150+ exam entries)
            </li>
            <li>
              &quot;% Top Bands&quot; = percentage of exam entries achieving Band
              5 or 6 (top 2 bands)
            </li>
            <li>
              &quot;DA Count&quot; = Distinguished Achiever awards (Band 6 in
              individual courses)
            </li>
            <li>
              Data covers {hscData.length} NSW schools. Rankings may differ from
              other sources due to methodology.
            </li>
            <li>
              For Victorian schools, see{" "}
              <Link href="/rankings/vce" className="link link-primary">
                VCE Rankings
              </Link>
              . For ICSEA rankings of all Australian schools, see{" "}
              <Link href="/rankings" className="link link-primary">
                ICSEA Rankings
              </Link>
              .
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
