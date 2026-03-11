import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolsByState, getStates, getSuburbs, STATE_NAMES } from "@/lib/schools";

export function generateStaticParams() {
  return Object.keys(getStates()).map((state) => ({ state }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const name = STATE_NAMES[state];
  if (!name) return { title: "State Not Found" };
  return {
    title: `Schools in ${name} | AU School Finder`,
    description: `Browse and compare all schools in ${name}, Australia. View ICSEA rankings, enrolment data and more.`,
  };
}

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

  return (
    <div>
      <div className="breadcrumbs text-sm mb-4">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li>{stateName}</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-2">Schools in {stateName}</h1>
      <p className="text-lg text-base-content/70 mb-6">
        {schools.length.toLocaleString()} schools across {stateSuburbs.length} suburbs
      </p>

      <h2 className="text-2xl font-bold mb-4">Top Suburbs</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {stateSuburbs.slice(0, 60).map(([key, data]) => (
          <Link
            key={key}
            href={`/suburb/${key}`}
            className="badge badge-lg badge-outline hover:badge-primary transition-colors"
          >
            {data.name} ({data.count})
          </Link>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">Top Schools by ICSEA</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>#</th>
              <th>School</th>
              <th>Suburb</th>
              <th>Type</th>
              <th>ICSEA</th>
              <th>Enrolments</th>
            </tr>
          </thead>
          <tbody>
            {topSchools.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td><Link href={`/school/${s.slug}`} className="link link-primary">{s.name}</Link></td>
                <td>{s.suburb}</td>
                <td><span className="badge badge-sm">{s.type}</span></td>
                <td className="font-bold">{s.icsea}</td>
                <td>{s.enrolments.total?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
