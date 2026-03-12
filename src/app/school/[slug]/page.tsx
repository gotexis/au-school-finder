import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolBySlug, getSchools, STATE_NAMES } from "@/lib/schools";
import { icseaColor, schoolTypeEmoji, sectorBadgeClass } from "@/lib/utils";

export async function generateStaticParams() {
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

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: school.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: school.suburb,
      addressRegion: school.state,
      postalCode: school.postcode,
      addressCountry: "AU",
    },
    ...(school.url && { url: school.url }),
    ...(school.latitude && school.longitude && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: school.latitude,
        longitude: school.longitude,
      },
    }),
  };

  return (
    <div className="max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href={`/state/${school.state}`}>{STATE_NAMES[school.state]}</Link></li>
          <li><Link href={`/suburb/${school.suburb.toLowerCase().replace(/\s+/g, "-")}-${school.state.toLowerCase()}`}>{school.suburb}</Link></li>
          <li className="text-base-content/50">{school.name}</li>
        </ul>
      </div>

      {/* Header Card */}
      <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-base-300 shadow-sm mb-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {schoolTypeEmoji(school.type)} {school.name}
              </h1>
              <p className="text-lg text-base-content/60 mt-2">
                {school.suburb}, {STATE_NAMES[school.state] || school.state} {school.postcode}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="badge badge-lg badge-outline">{school.type}</span>
                <span className={`badge badge-lg ${sectorBadgeClass(school.sector)}`}>{school.sector}</span>
                <span className="badge badge-lg badge-ghost">{school.yearRange}</span>
                {school.geolocation && (
                  <span className="badge badge-lg badge-ghost">📍 {school.geolocation}</span>
                )}
              </div>
            </div>
            {school.url && (
              <a
                href={school.url}
                className="btn btn-primary btn-sm gap-2"
                target="_blank"
                rel="noopener"
              >
                🌐 Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body p-5 text-center">
            <div className="text-sm font-medium text-base-content/60 uppercase tracking-wide">ICSEA Score</div>
            <div className={`text-4xl font-extrabold tabular-nums mt-1 ${icseaColor(school.icsea)}`}>
              {school.icsea || "N/A"}
            </div>
            <div className="text-sm text-base-content/50 mt-1">
              {school.icseaPercentile != null ? `${school.icseaPercentile}th percentile` : ""}
            </div>
          </div>
        </div>
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body p-5 text-center">
            <div className="text-sm font-medium text-base-content/60 uppercase tracking-wide">Students</div>
            <div className="text-4xl font-extrabold tabular-nums mt-1 text-secondary">
              {school.enrolments.total?.toLocaleString() || "N/A"}
            </div>
            <div className="text-sm text-base-content/50 mt-1">
              {school.enrolments.girls != null && school.enrolments.boys != null
                ? `${school.enrolments.girls} girls · ${school.enrolments.boys} boys`
                : ""}
            </div>
          </div>
        </div>
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body p-5 text-center">
            <div className="text-sm font-medium text-base-content/60 uppercase tracking-wide">Student : Teacher</div>
            <div className="text-4xl font-extrabold tabular-nums mt-1">
              {studentTeacherRatio || "N/A"}
            </div>
            <div className="text-sm text-base-content/50 mt-1">
              {school.staff.teachingFTE != null ? `${school.staff.teachingFTE} FTE teachers` : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* SEA Quartiles */}
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">📊 Socio-Educational Advantage</h2>
            <p className="text-xs text-base-content/50 mb-3">Distribution of students by parental education & occupation</p>
            <div className="space-y-3">
              {[
                { label: "Bottom Quarter", value: school.seaQuarters.bottom, color: "progress-error" },
                { label: "Lower Middle", value: school.seaQuarters.lowerMiddle, color: "progress-warning" },
                { label: "Upper Middle", value: school.seaQuarters.upperMiddle, color: "progress-info" },
                { label: "Top Quarter", value: school.seaQuarters.top, color: "progress-success" },
              ].map((q) => (
                <div key={q.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content/70">{q.label}</span>
                    <span className="font-bold tabular-nums">{q.value ?? 0}%</span>
                  </div>
                  <progress className={`progress ${q.color} w-full h-3`} value={q.value ?? 0} max={100} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* School Details */}
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">📋 School Details</h2>
            <div className="divide-y divide-base-300">
              {[
                { label: "Governing Body", value: school.governingBody },
                { label: "Location Type", value: school.geolocation },
                { label: "Local Government", value: school.lga },
                { label: "Statistical Area", value: school.sa4 },
                { label: "Indigenous Students", value: school.enrolments.indigenous != null ? `${school.enrolments.indigenous}%` : "N/A" },
                { label: "LBOTE Students", value: school.enrolments.lbote != null ? `${school.enrolments.lbote}%` : "N/A" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2.5 text-sm">
                  <span className="text-base-content/60">{row.label}</span>
                  <span className="font-medium text-right">{row.value || "N/A"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Staff Section */}
      <div className="card bg-base-200 border border-base-300 shadow-sm mb-8">
        <div className="card-body">
          <h2 className="card-title text-lg">👩‍🏫 Staff</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {[
              { label: "Teaching Staff", value: school.staff.teaching, sub: `${school.staff.teachingFTE} FTE` },
              { label: "Non-Teaching", value: school.staff.nonTeaching, sub: `${school.staff.nonTeachingFTE} FTE` },
              { label: "Total Staff", value: (school.staff.teaching || 0) + (school.staff.nonTeaching || 0), sub: "headcount" },
              { label: "Total FTE", value: ((school.staff.teachingFTE || 0) + (school.staff.nonTeachingFTE || 0)).toFixed(1), sub: "full-time equivalent" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-xl bg-base-100">
                <div className="text-2xl font-bold tabular-nums">{item.value ?? "N/A"}</div>
                <div className="text-xs text-base-content/50 mt-1">{item.sub}</div>
                <div className="text-xs font-medium text-base-content/70 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade Enrolments */}
      {school.gradeEnrolments && Object.keys(school.gradeEnrolments).length > 0 && (
        <div className="card bg-base-200 border border-base-300 shadow-sm mb-8">
          <div className="card-body">
            <h2 className="card-title text-lg">📈 Enrolments by Grade</h2>
            <div className="flex flex-wrap gap-3 mt-2">
              {Object.entries(school.gradeEnrolments)
                .filter(([, v]) => v != null && v > 0)
                .map(([grade, count]) => (
                  <div key={grade} className="text-center p-3 rounded-xl bg-base-100 min-w-[70px]">
                    <div className="text-lg font-bold tabular-nums">{count}</div>
                    <div className="text-xs text-base-content/60">{grade}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
