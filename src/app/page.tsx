import Link from "next/link";
import { getStates, getSchools, STATE_NAMES } from "@/lib/schools";
import { icseaColor, schoolTypeEmoji, sectorBadgeClass } from "@/lib/utils";

export default function Home() {
  const states = getStates();
  const schools = getSchools();
  const totalSchools = schools.length;
  const avgIcsea = Math.round(
    schools.filter((s) => s.icsea).reduce((a, s) => a + (s.icsea || 0), 0) /
      schools.filter((s) => s.icsea).length
  );

  const stateEmoji: Record<string, string> = {
    NSW: "🏙️", VIC: "🌆", QLD: "☀️", SA: "🍷", WA: "⛏️", TAS: "🏔️", NT: "🐊", ACT: "🏛️",
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="hero rounded-2xl bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 shadow-sm">
        <div className="hero-content text-center py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-extrabold tracking-tight">
              Find the Right School
            </h1>
            <p className="py-6 text-xl text-base-content/70 max-w-2xl mx-auto">
              Compare <strong className="text-primary">{totalSchools.toLocaleString()}</strong> Australian schools
              with official ACARA data. ICSEA rankings, enrolment stats, staff ratios, and more.
            </p>
            <div className="stats shadow-lg bg-base-100 mt-2">
              <div className="stat px-8">
                <div className="stat-figure text-primary text-3xl">🏫</div>
                <div className="stat-title">Schools</div>
                <div className="stat-value text-primary tabular-nums">
                  {totalSchools.toLocaleString()}
                </div>
                <div className="stat-desc">Across all states</div>
              </div>
              <div className="stat px-8">
                <div className="stat-figure text-secondary text-3xl">📊</div>
                <div className="stat-title">Avg ICSEA</div>
                <div className="stat-value text-secondary tabular-nums">{avgIcsea}</div>
                <div className="stat-desc">National average</div>
              </div>
              <div className="stat px-8">
                <div className="stat-figure text-accent text-3xl">🗺️</div>
                <div className="stat-title">States</div>
                <div className="stat-value tabular-nums">{Object.keys(states).length}</div>
                <div className="stat-desc">& territories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* States Grid */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Browse by State</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(states)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([code, data]) => (
              <Link
                key={code}
                href={`/state/${code}`}
                className="card bg-base-200 shadow-sm card-hover cursor-pointer border border-base-300 hover:border-primary"
              >
                <div className="card-body p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stateEmoji[code] || "📍"}</span>
                    <h3 className="card-title text-lg">{STATE_NAMES[code] || code}</h3>
                  </div>
                  <div className="flex gap-4 text-sm text-base-content/60 mt-1">
                    <span className="font-semibold text-base-content">{data.count.toLocaleString()}</span> schools
                    <span>·</span>
                    <span className="font-semibold text-base-content">{data.suburbs}</span> suburbs
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Top Schools */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Top 50 Schools by ICSEA</h2>
        <div className="card bg-base-200 shadow-sm border border-base-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="bg-base-300">
                <tr>
                  <th className="w-12">#</th>
                  <th>School</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Sector</th>
                  <th className="text-right">ICSEA</th>
                  <th className="text-right">Students</th>
                </tr>
              </thead>
              <tbody>
                {schools
                  .filter((s) => s.icsea)
                  .sort((a, b) => (b.icsea || 0) - (a.icsea || 0))
                  .slice(0, 50)
                  .map((s, i) => (
                    <tr key={s.id} className="hover">
                      <td className="text-base-content/50 tabular-nums">{i + 1}</td>
                      <td>
                        <Link href={`/school/${s.slug}`} className="link link-primary font-medium hover:link-hover">
                          {schoolTypeEmoji(s.type)} {s.name}
                        </Link>
                      </td>
                      <td className="text-sm">{s.suburb}, {s.state}</td>
                      <td><span className="badge badge-sm badge-outline">{s.type}</span></td>
                      <td><span className={`badge badge-sm ${sectorBadgeClass(s.sector)}`}>{s.sector}</span></td>
                      <td className={`text-right tabular-nums ${icseaColor(s.icsea)}`}>
                        {s.icsea}
                      </td>
                      <td className="text-right tabular-nums">{s.enrolments.total?.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
