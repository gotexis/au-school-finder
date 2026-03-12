import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolsByState, getStates, getSuburbs, STATE_NAMES } from "@/lib/schools";
import { icseaColor, schoolTypeEmoji, sectorBadgeClass } from "@/lib/utils";

export function generateStaticParams() {
  return Object.keys(getStates()).map((state) => ({ state }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const name = STATE_NAMES[state];
  if (!name) return { title: "State Not Found" };
  return {
    title: `Schools in ${name} — Rankings & Data | AU School Finder`,
    description: `Browse and compare ${getSchoolsByState(state).length.toLocaleString()} schools in ${name}, Australia. ICSEA rankings, enrolment data, staff ratios.`,
  };
}

const stateEmoji: Record<string, string> = {
  NSW: "🏙️", VIC: "🌆", QLD: "☀️", SA: "🍷", WA: "⛏️", TAS: "🏔️", NT: "🐊", ACT: "🏛️",
};

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const stateName = STATE_NAMES[state];
  if (!stateName) notFound();

  const schools = getSchoolsByState(state);
  const suburbs = getSuburbs();
  const stateSuburbs = Object.entries(suburbs)
    .filter(([, v]) => v.state === state)
    .sort((a, b) => b[1].count - a[1].count);

  const topSchools = schools
    .filter((s) => s.icsea)
    .sort((a, b) => (b.icsea || 0) - (a.icsea || 0))
    .slice(0, 30);

  const avgIcsea = schools.filter((s) => s.icsea).length
    ? Math.round(schools.filter((s) => s.icsea).reduce((a, s) => a + (s.icsea || 0), 0) / schools.filter((s) => s.icsea).length)
    : null;

  // Sector breakdown
  const sectors = schools.reduce((acc, s) => {
    acc[s.sector] = (acc[s.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="breadcrumbs text-sm mb-4">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li className="text-base-content/50">{stateName}</li>
          </ul>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {stateEmoji[state] || "📍"} Schools in {stateName}
        </h1>

        <div className="stats shadow-sm bg-base-200 border border-base-300 mt-6 w-full">
          <div className="stat">
            <div className="stat-figure text-primary text-2xl">🏫</div>
            <div className="stat-title">Total Schools</div>
            <div className="stat-value text-primary tabular-nums">{schools.length.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Suburbs</div>
            <div className="stat-value tabular-nums">{stateSuburbs.length.toLocaleString()}</div>
          </div>
          {avgIcsea && (
            <div className="stat">
              <div className="stat-title">Avg ICSEA</div>
              <div className={`stat-value tabular-nums ${icseaColor(avgIcsea)}`}>{avgIcsea}</div>
            </div>
          )}
        </div>

        {/* Sector badges */}
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(sectors).sort((a, b) => b[1] - a[1]).map(([sector, count]) => (
            <div key={sector} className={`badge badge-lg gap-2 ${sectorBadgeClass(sector)}`}>
              {sector} <span className="badge badge-sm">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suburbs */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Browse by Suburb</h2>
        <div className="flex flex-wrap gap-2">
          {stateSuburbs.slice(0, 80).map(([key, data]) => (
            <Link
              key={key}
              href={`/suburb/${key}`}
              className="badge badge-lg badge-outline hover:badge-primary transition-all cursor-pointer gap-1"
            >
              {data.name} <span className="text-xs opacity-60">({data.count})</span>
            </Link>
          ))}
          {stateSuburbs.length > 80 && (
            <span className="badge badge-lg badge-ghost">+{stateSuburbs.length - 80} more</span>
          )}
        </div>
      </section>

      {/* Top Schools */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Schools by ICSEA</h2>
        <div className="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="bg-base-300">
                <tr>
                  <th className="w-12">#</th>
                  <th>School</th>
                  <th>Suburb</th>
                  <th>Type</th>
                  <th>Sector</th>
                  <th className="text-right">ICSEA</th>
                  <th className="text-right">Students</th>
                </tr>
              </thead>
              <tbody>
                {topSchools.map((s, i) => (
                  <tr key={s.id} className="hover">
                    <td className="text-base-content/50 tabular-nums">{i + 1}</td>
                    <td>
                      <Link href={`/school/${s.slug}`} className="link link-primary font-medium">
                        {schoolTypeEmoji(s.type)} {s.name}
                      </Link>
                    </td>
                    <td className="text-sm">
                      <Link href={`/suburb/${s.suburb.toLowerCase().replace(/\s+/g, "-")}-${s.state.toLowerCase()}`} className="link link-hover">
                        {s.suburb}
                      </Link>
                    </td>
                    <td><span className="badge badge-sm badge-outline">{s.type}</span></td>
                    <td><span className={`badge badge-sm ${sectorBadgeClass(s.sector)}`}>{s.sector}</span></td>
                    <td className={`text-right tabular-nums ${icseaColor(s.icsea)}`}>{s.icsea}</td>
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
