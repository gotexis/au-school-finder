"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface SearchResult {
  slug: string;
  name: string;
  suburb: string;
  state: string;
  type: string;
  sector: string;
  icsea: number | null;
}

interface School {
  slug: string;
  name: string;
  suburb: string;
  state: string;
  type: string;
  sector: string;
  icsea: number | null;
  icseaPercentile: number | null;
  seaQuarters: { bottom: number | null; lowerMiddle: number | null; upperMiddle: number | null; top: number | null };
  staff: { teaching: number | null; teachingFTE: number | null; nonTeaching: number | null; nonTeachingFTE: number | null };
  enrolments: { total: number | null; girls: number | null; boys: number | null; fte: number | null; indigenous: number | null; lbote: number | null };
  yearRange: string;
  postcode: string;
}

function icseaColor(v: number | null) {
  if (!v) return "";
  if (v >= 1100) return "text-success";
  if (v >= 1000) return "text-primary";
  if (v >= 900) return "text-warning";
  return "text-error";
}

function bestOf(vals: (number | null)[]): number | null {
  const nums = vals.filter((v): v is number => v !== null);
  return nums.length ? Math.max(...nums) : null;
}

export default function CompareClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    const res = await fetch(`/api/schools/search?q=${encodeURIComponent(q)}`);
    setResults(await res.json());
    setShowResults(true);
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounce.current);
  }, [query, search]);

  useEffect(() => {
    if (selected.length === 0) { setSchools([]); return; }
    setLoading(true);
    fetch(`/api/schools/compare?slugs=${selected.join(",")}`)
      .then((r) => r.json())
      .then((d) => { setSchools(d); setLoading(false); });
  }, [selected]);

  const add = (slug: string) => {
    if (!selected.includes(slug) && selected.length < 6) {
      setSelected([...selected, slug]);
    }
    setQuery("");
    setShowResults(false);
  };

  const remove = (slug: string) => setSelected(selected.filter((s) => s !== slug));

  const rows: { label: string; render: (s: School) => React.ReactNode }[] = [
    { label: "Location", render: (s) => `${s.suburb}, ${s.state} ${s.postcode}` },
    { label: "Type", render: (s) => s.type },
    { label: "Sector", render: (s) => s.sector },
    { label: "Year Range", render: (s) => s.yearRange },
    {
      label: "ICSEA",
      render: (s) => (
        <span className={`text-xl font-bold ${icseaColor(s.icsea)}`}>
          {s.icsea ?? "N/A"}
        </span>
      ),
    },
    { label: "ICSEA Percentile", render: (s) => s.icseaPercentile != null ? `${s.icseaPercentile}%` : "N/A" },
    { label: "Total Students", render: (s) => s.enrolments.total?.toLocaleString() ?? "N/A" },
    { label: "Girls", render: (s) => s.enrolments.girls?.toLocaleString() ?? "N/A" },
    { label: "Boys", render: (s) => s.enrolments.boys?.toLocaleString() ?? "N/A" },
    { label: "Indigenous %", render: (s) => s.enrolments.indigenous != null && s.enrolments.total ? `${((s.enrolments.indigenous / s.enrolments.total) * 100).toFixed(1)}%` : "N/A" },
    { label: "LBOTE %", render: (s) => s.enrolments.lbote != null && s.enrolments.total ? `${((s.enrolments.lbote / s.enrolments.total) * 100).toFixed(1)}%` : "N/A" },
    { label: "Teaching Staff", render: (s) => s.staff.teaching?.toLocaleString() ?? "N/A" },
    { label: "Student:Teacher", render: (s) => s.staff.teachingFTE && s.enrolments.fte ? `${(s.enrolments.fte / s.staff.teachingFTE).toFixed(1)}:1` : "N/A" },
    {
      label: "SEA Bottom Quarter",
      render: (s) => s.seaQuarters.bottom != null ? (
        <div className="flex items-center gap-2">
          <progress className="progress progress-error w-20" value={s.seaQuarters.bottom} max={100} />
          <span>{s.seaQuarters.bottom}%</span>
        </div>
      ) : "N/A",
    },
    {
      label: "SEA Top Quarter",
      render: (s) => s.seaQuarters.top != null ? (
        <div className="flex items-center gap-2">
          <progress className="progress progress-success w-20" value={s.seaQuarters.top} max={100} />
          <span>{s.seaQuarters.top}%</span>
        </div>
      ) : "N/A",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li className="text-base-content/50">Compare Schools</li>
        </ul>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
        ⚖️ Compare Schools
      </h1>
      <p className="text-base-content/60 mb-8">
        Search and select up to 6 schools to compare side by side.
      </p>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Search by school name or suburb..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {showResults && results.length > 0 && (
          <ul className="absolute z-50 w-full bg-base-100 border border-base-300 rounded-box shadow-xl mt-1 max-h-80 overflow-y-auto">
            {results.map((r) => (
              <li key={r.slug}>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-base-200 flex justify-between items-center"
                  onMouseDown={() => add(r.slug)}
                >
                  <span>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-sm text-base-content/50 ml-2">
                      {r.suburb}, {r.state}
                    </span>
                  </span>
                  {r.icsea && (
                    <span className={`badge badge-sm ${icseaColor(r.icsea) || ""}`}>
                      ICSEA {r.icsea}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selected.map((slug) => {
            const s = schools.find((sc) => sc.slug === slug);
            return (
              <span key={slug} className="badge badge-lg badge-primary gap-2">
                {s?.name || slug}
                <button onClick={() => remove(slug)} className="btn btn-ghost btn-xs">✕</button>
              </span>
            );
          })}
        </div>
      )}

      {/* Comparison table */}
      {loading && <span className="loading loading-spinner loading-lg" />}
      {schools.length >= 2 && !loading && (
        <div className="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="bg-base-300">
                <tr>
                  <th className="min-w-[140px]">Metric</th>
                  {schools.map((s) => (
                    <th key={s.slug} className="min-w-[160px]">
                      <Link href={`/school/${s.slug}`} className="link link-primary">
                        {s.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="hover">
                    <td className="font-medium text-base-content/70">{row.label}</td>
                    {schools.map((s) => (
                      <td key={s.slug}>{row.render(s)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {schools.length === 1 && !loading && (
        <div className="alert alert-info">
          <span>Add at least one more school to compare.</span>
        </div>
      )}

      {selected.length === 0 && (
        <div className="text-center py-16 text-base-content/40">
          <p className="text-6xl mb-4">⚖️</p>
          <p className="text-lg">Search for schools above to start comparing.</p>
        </div>
      )}
    </div>
  );
}
