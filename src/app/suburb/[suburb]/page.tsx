import Link from "next/link";
import { notFound } from "next/navigation";
import { getSuburbs, getSchoolsBySuburb, STATE_NAMES } from "@/lib/schools";
import { icseaColor, schoolTypeEmoji, sectorBadgeClass } from "@/lib/utils";
import MapView from "@/components/MapView";

export function generateStaticParams() {
  const suburbs = getSuburbs();
  return Object.entries(suburbs)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 200)
    .map(([key]) => ({ suburb: key }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ suburb: string }> }) {
  const { suburb: suburbKey } = await params;
  const suburbs = getSuburbs();
  const data = suburbs[suburbKey];
  if (!data) return { title: "Suburb Not Found" };
  return {
    title: `Schools in ${data.name}, ${data.state} ${data.postcode} | AU School Finder`,
    description: `Compare ${data.count} schools in ${data.name}, ${STATE_NAMES[data.state]}. View ICSEA rankings, enrolments and staff data.`,
  };
}

export default async function SuburbPage({ params }: { params: Promise<{ suburb: string }> }) {
  const { suburb: suburbKey } = await params;
  const suburbs = getSuburbs();
  const data = suburbs[suburbKey];
  if (!data) notFound();

  const schools = getSchoolsBySuburb(data.name, data.state);
  const avgIcsea = schools.filter((s) => s.icsea).length
    ? Math.round(schools.filter((s) => s.icsea).reduce((a, s) => a + (s.icsea || 0), 0) / schools.filter((s) => s.icsea).length)
    : null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href={`/state/${data.state}`}>{STATE_NAMES[data.state]}</Link></li>
          <li className="text-base-content/50">{data.name}</li>
        </ul>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          📍 Schools in {data.name}
        </h1>
        <p className="text-lg text-base-content/60 mt-2">
          {STATE_NAMES[data.state]} {data.postcode}
        </p>
        <div className="stats shadow-sm bg-base-200 border border-base-300 mt-4">
          <div className="stat">
            <div className="stat-title">Schools</div>
            <div className="stat-value text-primary tabular-nums">{schools.length}</div>
          </div>
          {avgIcsea && (
            <div className="stat">
              <div className="stat-title">Avg ICSEA</div>
              <div className={`stat-value tabular-nums ${icseaColor(avgIcsea)}`}>{avgIcsea}</div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="mb-8">
        <MapView schools={schools} height="400px" />
      </div>

      {/* School Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools
          .sort((a, b) => (b.icsea || 0) - (a.icsea || 0))
          .map((s) => (
            <Link
              key={s.id}
              href={`/school/${s.slug}`}
              className="card bg-base-200 border border-base-300 shadow-sm card-hover cursor-pointer hover:border-primary"
            >
              <div className="card-body p-5">
                <h3 className="card-title text-base">
                  {schoolTypeEmoji(s.type)} {s.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="badge badge-sm badge-outline">{s.type}</span>
                  <span className={`badge badge-sm ${sectorBadgeClass(s.sector)}`}>{s.sector}</span>
                  <span className="badge badge-sm badge-ghost">{s.yearRange}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <span className="text-base-content/50">ICSEA</span>
                    <div className={`text-xl font-bold tabular-nums ${icseaColor(s.icsea)}`}>
                      {s.icsea || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-base-content/50">Students</span>
                    <div className="text-xl font-bold tabular-nums">
                      {s.enrolments.total?.toLocaleString() || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
