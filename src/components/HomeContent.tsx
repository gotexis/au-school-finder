"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { icseaColor, schoolTypeEmoji, sectorBadgeClass } from "@/lib/utils";

interface School {
  id: string;
  slug: string;
  name: string;
  suburb: string;
  state: string;
  type: string;
  sector: string;
  icsea: number | null;
  enrolments: { total: number | null };
}

interface StateData {
  count: number;
  suburbs: number;
}

const STATE_NAMES: Record<string, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
  ACT: "Australian Capital Territory",
};

const STATE_NAMES_ZH: Record<string, string> = {
  NSW: "新南威尔士州",
  VIC: "维多利亚州",
  QLD: "昆士兰州",
  SA: "南澳大利亚州",
  WA: "西澳大利亚州",
  TAS: "塔斯马尼亚州",
  NT: "北领地",
  ACT: "澳大利亚首都领地",
};

const stateEmoji: Record<string, string> = {
  NSW: "🏙️", VIC: "🌆", QLD: "☀️", SA: "🍷", WA: "⛏️", TAS: "🏔️", NT: "🐊", ACT: "🏛️",
};

export function HomeContent({
  states,
  top50,
  totalSchools,
  avgIcsea,
}: {
  states: Record<string, StateData>;
  top50: School[];
  totalSchools: number;
  avgIcsea: number;
}) {
  const { t, locale } = useI18n();
  const stateNames = locale === "zh" ? STATE_NAMES_ZH : STATE_NAMES;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="hero rounded-2xl bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 shadow-sm">
        <div className="hero-content text-center py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-extrabold tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="py-6 text-xl text-base-content/70 max-w-2xl mx-auto">
              {t("hero.desc.pre")}
              <strong className="text-primary">{totalSchools.toLocaleString()}</strong>
              {t("hero.desc.mid")}
            </p>
            <div className="stats shadow-lg bg-base-100 mt-2">
              <div className="stat px-8">
                <div className="stat-figure text-primary text-3xl">🏫</div>
                <div className="stat-title">{t("stat.schools")}</div>
                <div className="stat-value text-primary tabular-nums">
                  {totalSchools.toLocaleString()}
                </div>
                <div className="stat-desc">{t("stat.schools.desc")}</div>
              </div>
              <div className="stat px-8">
                <div className="stat-figure text-secondary text-3xl">📊</div>
                <div className="stat-title">{t("stat.avgIcsea")}</div>
                <div className="stat-value text-secondary tabular-nums">{avgIcsea}</div>
                <div className="stat-desc">{t("stat.avgIcsea.desc")}</div>
              </div>
              <div className="stat px-8">
                <div className="stat-figure text-accent text-3xl">🗺️</div>
                <div className="stat-title">{t("stat.states")}</div>
                <div className="stat-value tabular-nums">{Object.keys(states).length}</div>
                <div className="stat-desc">{t("stat.states.desc")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* States Grid */}
      <section>
        <h2 className="text-3xl font-bold mb-6">{t("section.browseByState")}</h2>
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
                    <h3 className="card-title text-lg">{stateNames[code] || code}</h3>
                  </div>
                  <div className="flex gap-4 text-sm text-base-content/60 mt-1">
                    <span className="font-semibold text-base-content">{data.count.toLocaleString()}</span> {t("schools")}
                    <span>·</span>
                    <span className="font-semibold text-base-content">{data.suburbs}</span> {t("suburbs")}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Top Schools */}
      <section>
        <h2 className="text-3xl font-bold mb-6">{t("section.top50")}</h2>
        <div className="card bg-base-200 shadow-sm border border-base-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="bg-base-300">
                <tr>
                  <th className="w-12">{t("table.rank")}</th>
                  <th>{t("table.school")}</th>
                  <th>{t("table.location")}</th>
                  <th>{t("table.type")}</th>
                  <th>{t("table.sector")}</th>
                  <th className="text-right">{t("table.icsea")}</th>
                  <th className="text-right">{t("table.students")}</th>
                </tr>
              </thead>
              <tbody>
                {top50.map((s, i) => (
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
