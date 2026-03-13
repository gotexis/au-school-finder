import Link from "next/link";
import type { Metadata } from "next";
import vceData from "@/data/vce-rankings.json";

export const metadata: Metadata = {
  title: "VCE School Rankings 2025 — Median Study Scores | AU School Finder",
  description:
    "Ranking of 540+ Victorian schools by VCE median study score. Official VCAA 2025 data. Compare VCE results, % of 40+ scores, and completion rates.",
};

function getScoreColor(score: number): string {
  if (score >= 36) return "text-emerald-600 bg-emerald-50";
  if (score >= 33) return "text-green-600 bg-green-50";
  if (score >= 30) return "text-yellow-600 bg-yellow-50";
  if (score >= 27) return "text-orange-500 bg-orange-50";
  return "text-red-500 bg-red-50";
}

function getScoreGrade(score: number): string {
  if (score >= 37) return "A+";
  if (score >= 35) return "A";
  if (score >= 33) return "B+";
  if (score >= 31) return "B";
  if (score >= 29) return "C+";
  if (score >= 27) return "C";
  return "D";
}

interface VceSchool {
  name: string;
  locality: string;
  medianStudyScore: number | null;
  pct40Plus: number | null;
  pctCompletion: number | null;
  numVceStudents: number | null;
  pctVtac: number | null;
  schoolId?: string;
  slug?: string;
  suburb?: string;
  postcode?: string;
  icsea?: number | null;
}

export default async function VceRankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sortBy = params.sort || "median";

  const schools = [...(vceData as unknown as VceSchool[])].sort((a, b) => {
    if (sortBy === "40plus") return (b.pct40Plus || 0) - (a.pct40Plus || 0);
    if (sortBy === "students")
      return (b.numVceStudents || 0) - (a.numVceStudents || 0);
    return (b.medianStudyScore || 0) - (a.medianStudyScore || 0);
  });

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 text-white py-12">
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
              ICSEA Rankings
            </Link>
            <span className="text-white/50">/</span>
            <span className="text-sm">VCE Rankings</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            🏆 VCE School Rankings 2025
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Official VCAA data for {schools.length} Victorian schools. Ranked by
            median VCE study score, with completion rates and 40+ score
            percentages.
          </p>
          <div className="flex gap-4 mt-4 text-sm text-white/60">
            <span>📊 Source: VCAA Senior Secondary Completion 2025</span>
            <span>🔄 Updated: December 2025</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Sort buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link
            href="/rankings/vce?sort=median"
            className={`btn btn-sm ${sortBy === "median" ? "btn-primary" : "btn-ghost"}`}
          >
            📈 By Median Score
          </Link>
          <Link
            href="/rankings/vce?sort=40plus"
            className={`btn btn-sm ${sortBy === "40plus" ? "btn-primary" : "btn-ghost"}`}
          >
            ⭐ By % 40+ Scores
          </Link>
          <Link
            href="/rankings/vce?sort=students"
            className={`btn btn-sm ${sortBy === "students" ? "btn-primary" : "btn-ghost"}`}
          >
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
                <th className="text-center">Median Score</th>
                <th className="text-center">Grade</th>
                <th className="text-center">% ≥40</th>
                <th className="text-center">Completion</th>
                <th className="text-center">VCE Students</th>
                <th className="text-center">% VTAC</th>
                {/* ICSEA if available */}
                <th className="text-center">ICSEA</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school, i) => (
                <tr key={`${school.name}-${i}`} className="hover">
                  <td className="font-mono text-base-content/50">{i + 1}</td>
                  <td>
                    {school.slug ? (
                      <Link
                        href={`/school/${school.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {school.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{school.name}</span>
                    )}
                    <div className="text-xs text-base-content/50">
                      {school.suburb || school.locality}
                      {school.postcode ? `, ${school.postcode}` : ""}
                    </div>
                  </td>
                  <td className="text-center">
                    {school.medianStudyScore !== null ? (
                      <span
                        className={`font-bold text-lg px-2 py-1 rounded ${getScoreColor(school.medianStudyScore)}`}
                      >
                        {school.medianStudyScore}
                      </span>
                    ) : (
                      <span className="text-base-content/30">—</span>
                    )}
                  </td>
                  <td className="text-center">
                    {school.medianStudyScore !== null && (
                      <span
                        className={`badge badge-sm font-bold ${getScoreColor(school.medianStudyScore)}`}
                      >
                        {getScoreGrade(school.medianStudyScore)}
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    {school.pct40Plus !== null ? (
                      <span className="font-medium">
                        {school.pct40Plus}%
                      </span>
                    ) : (
                      <span className="text-base-content/30">—</span>
                    )}
                  </td>
                  <td className="text-center">
                    {school.pctCompletion !== null ? (
                      <span
                        className={
                          school.pctCompletion >= 95
                            ? "text-emerald-600"
                            : school.pctCompletion >= 85
                              ? "text-yellow-600"
                              : "text-red-500"
                        }
                      >
                        {school.pctCompletion}%
                      </span>
                    ) : (
                      <span className="text-base-content/30">—</span>
                    )}
                  </td>
                  <td className="text-center">
                    {school.numVceStudents !== null ? (
                      <span>{school.numVceStudents}</span>
                    ) : (
                      <span className="text-base-content/30">—</span>
                    )}
                  </td>
                  <td className="text-center">
                    {school.pctVtac !== null ? (
                      <span>{school.pctVtac}%</span>
                    ) : (
                      <span className="text-base-content/30">—</span>
                    )}
                  </td>
                  <td className="text-center">
                    {school.icsea ? (
                      <span className="font-mono text-sm">{school.icsea}</span>
                    ) : (
                      <span className="text-base-content/30">—</span>
                    )}
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
            <li>
              Source: VCAA Senior Secondary Completion and Achievement
              Information 2025
            </li>
            <li>Median VCE study score ranges from 0-50 (state median ~30)</li>
            <li>
              &quot;% ≥40&quot; = percentage of study scores at 40 or above
              (top ~9% of state)
            </li>
            <li>
              Schools with fewer than 4 students may have suppressed data
            </li>
            <li>Victorian schools only. For ICSEA rankings of all Australian schools, see{" "}
              <Link href="/rankings" className="link link-primary">
                ICSEA Rankings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
