import Link from "next/link";
import { getStates, getSchools, STATE_NAMES } from "@/lib/schools";

export default function Home() {
  const states = getStates();
  const schools = getSchools();
  const totalSchools = schools.length;
  const avgIcsea = Math.round(
    schools.filter((s) => s.icsea).reduce((a, s) => a + (s.icsea || 0), 0) /
      schools.filter((s) => s.icsea).length
  );

  return (
    <div>
      <div className="hero bg-base-200 rounded-xl mb-8">
        <div className="hero-content text-center py-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">
              🏫 Australian School Finder
            </h1>
            <p className="py-4 text-lg">
              Search and compare <strong>{totalSchools.toLocaleString()}</strong>{" "}
              Australian schools across all states and territories. View ICSEA
              rankings, enrolment data, staff ratios, and more.
            </p>
            <div className="stats shadow mt-4">
              <div className="stat">
                <div className="stat-title">Total Schools</div>
                <div className="stat-value text-primary">
                  {totalSchools.toLocaleString()}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Avg ICSEA</div>
                <div className="stat-value text-secondary">{avgIcsea}</div>
              </div>
              <div className="stat">
                <div className="stat-title">States</div>
                <div className="stat-value">{Object.keys(states).length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Browse by State</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(states)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([code, data]) => (
            <Link
              key={code}
              href={`/state/${code}`}
              className="card bg-base-200 hover:bg-base-300 transition-colors"
            >
              <div className="card-body">
                <h3 className="card-title">{STATE_NAMES[code] || code}</h3>
                <p>
                  {data.count.toLocaleString()} schools · {data.suburbs}{" "}
                  suburbs
                </p>
              </div>
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
              <th>State</th>
              <th>Type</th>
              <th>ICSEA</th>
              <th>Enrolments</th>
            </tr>
          </thead>
          <tbody>
            {schools
              .filter((s) => s.icsea)
              .sort((a, b) => (b.icsea || 0) - (a.icsea || 0))
              .slice(0, 50)
              .map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>
                    <Link
                      href={`/school/${s.slug}`}
                      className="link link-primary"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td>{s.suburb}</td>
                  <td>{s.state}</td>
                  <td>
                    <span className="badge badge-sm">{s.type}</span>
                  </td>
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
