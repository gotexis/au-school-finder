import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolBySlug, getSchools, STATE_NAMES } from "@/lib/schools";

export async function generateStaticParams() {
  // Only pre-render top 500 schools by ICSEA for build speed; rest use SSR fallback
  const schools = getSchools()
    .filter((s) => s.icsea)
    .sort((a, b) => (b.icsea || 0) - (a.icsea || 0))
    .slice(0, 500);
  return schools.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = getSchoolBySlug(slug);
  if (!school) return { title: "School Not Found" };
  return {
    title: `${school.name} — ${school.suburb}, ${school.state} | AU School Finder`,
    description: `${school.name} in ${school.suburb}, ${STATE_NAMES[school.state] || school.state}. ICSEA: ${school.icsea || "N/A"}, Enrolments: ${school.enrolments.total || "N/A"}. ${school.type} ${school.sector} school.`,
  };
}

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = getSchoolBySlug(slug);
  if (!school) notFound();

  const studentTeacherRatio =
    school.enrolments.total && school.staff.teachingFTE
      ? (school.enrolments.total / school.staff.teachingFTE).toFixed(1)
      : null;

  return (
    <div>
      <div className="breadcrumbs text-sm mb-4">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href={`/state/${school.state}`}>{STATE_NAMES[school.state]}</Link></li>
          <li>{school.name}</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-2">{school.name}</h1>
      <p className="text-lg text-base-content/70 mb-6">
        {school.suburb}, {STATE_NAMES[school.state] || school.state} {school.postcode} · {school.type} · {school.sector} · {school.yearRange}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat bg-base-200 rounded-xl">
          <div className="stat-title">ICSEA Score</div>
          <div className="stat-value text-primary">{school.icsea || "N/A"}</div>
          <div className="stat-desc">Percentile: {school.icseaPercentile ?? "N/A"}th</div>
        </div>
        <div className="stat bg-base-200 rounded-xl">
          <div className="stat-title">Total Enrolments</div>
          <div className="stat-value text-secondary">{school.enrolments.total?.toLocaleString() || "N/A"}</div>
          <div className="stat-desc">
            {school.enrolments.girls} girls · {school.enrolments.boys} boys
          </div>
        </div>
        <div className="stat bg-base-200 rounded-xl">
          <div className="stat-title">Student:Teacher</div>
          <div className="stat-value">{studentTeacherRatio || "N/A"}</div>
          <div className="stat-desc">{school.staff.teachingFTE} FTE teachers</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Socio-Educational Advantage</h2>
            <div className="space-y-2">
              {[
                { label: "Bottom Quarter", value: school.seaQuarters.bottom },
                { label: "Lower Middle", value: school.seaQuarters.lowerMiddle },
                { label: "Upper Middle", value: school.seaQuarters.upperMiddle },
                { label: "Top Quarter", value: school.seaQuarters.top },
              ].map((q) => (
                <div key={q.label} className="flex items-center gap-2">
                  <span className="w-32 text-sm">{q.label}</span>
                  <progress className="progress progress-primary flex-1" value={q.value ?? 0} max={100} />
                  <span className="w-10 text-right text-sm font-bold">{q.value ?? 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">School Details</h2>
            <table className="table table-sm">
              <tbody>
                <tr><td className="font-semibold">Governing Body</td><td>{school.governingBody}</td></tr>
                <tr><td className="font-semibold">Location</td><td>{school.geolocation}</td></tr>
                <tr><td className="font-semibold">LGA</td><td>{school.lga}</td></tr>
                <tr><td className="font-semibold">Indigenous %</td><td>{school.enrolments.indigenous ?? "N/A"}%</td></tr>
                <tr><td className="font-semibold">LBOTE %</td><td>{school.enrolments.lbote ?? "N/A"}%</td></tr>
                {school.url && (
                  <tr>
                    <td className="font-semibold">Website</td>
                    <td><a href={school.url} className="link link-primary" target="_blank" rel="noopener">{school.url}</a></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 mb-8">
        <div className="card-body">
          <h2 className="card-title">Staff</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat"><div className="stat-title">Teaching</div><div className="stat-value text-sm">{school.staff.teaching}</div><div className="stat-desc">{school.staff.teachingFTE} FTE</div></div>
            <div className="stat"><div className="stat-title">Non-Teaching</div><div className="stat-value text-sm">{school.staff.nonTeaching}</div><div className="stat-desc">{school.staff.nonTeachingFTE} FTE</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
