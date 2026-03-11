import Link from "next/link";
import { notFound } from "next/navigation";
import { getSuburbs, getSchoolsBySuburb, STATE_NAMES } from "@/lib/schools";

export function generateStaticParams() {
  // Pre-render top 200 suburbs by school count
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

  return (
    <div>
      <div className="breadcrumbs text-sm mb-4">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href={`/state/${data.state}`}>{STATE_NAMES[data.state]}</Link></li>
          <li>{data.name}</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        Schools in {data.name}, {data.state} {data.postcode}
      </h1>
      <p className="text-lg text-base-content/70 mb-6">
        {schools.length} schools in this suburb
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools
          .sort((a, b) => (b.icsea || 0) - (a.icsea || 0))
          .map((s) => (
            <Link key={s.id} href={`/school/${s.slug}`} className="card bg-base-200 hover:bg-base-300 transition-colors">
              <div className="card-body">
                <h3 className="card-title text-base">{s.name}</h3>
                <div className="flex flex-wrap gap-1">
                  <span className="badge badge-primary badge-sm">{s.type}</span>
                  <span className="badge badge-secondary badge-sm">{s.sector}</span>
                  <span className="badge badge-sm">{s.yearRange}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-base-content/60">ICSEA:</span>{" "}
                    <span className="font-bold">{s.icsea || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-base-content/60">Students:</span>{" "}
                    <span className="font-bold">{s.enrolments.total?.toLocaleString() || "N/A"}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
