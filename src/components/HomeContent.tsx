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

const stateCardClass: Record<string, string> = {
  NSW: "state-card-nsw", VIC: "state-card-vic", QLD: "state-card-qld",
  SA: "state-card-sa", WA: "state-card-wa", TAS: "state-card-tas",
  NT: "state-card-nt", ACT: "state-card-act",
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
    <div className="space-y-16">
      {/* Hero — animated gradient with search */}
      <div className="hero-animated rounded-3xl shadow-xl -mx-4 sm:mx-0 overflow-hidden">
        <div className="hero-overlay bg-black/20 rounded-3xl"></div>
        <div className="hero-content text-center py-20 md:py-28 text-white relative z-10">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
              {locale === "zh" ? "覆盖全澳所有州和领地" : "Covering all Australian states & territories"}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {t("hero.title")}
            </h1>
            <p className="py-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {t("hero.desc.pre")}
              <strong className="text-white font-bold">{totalSchools.toLocaleString()}</strong>
              {t("hero.desc.mid")}
            </p>

            {/* Search bar */}
            <div className="flex justify-center mb-8">
              <div className="join w-full max-w-lg">
                <input
                  type="text"
                  placeholder={locale === "zh" ? "搜索学校名称、城区或邮编..." : "Search school name, suburb or postcode..."}
                  className="input input-lg join-item flex-1 bg-white/95 text-base-content placeholder:text-base-content/40 search-glow border-0 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      window.location.href = `/compare?q=${encodeURIComponent(e.currentTarget.value)}`;
                    }
                  }}
                />
                <button
                  className="btn btn-lg join-item bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>(".search-glow");
                    if (input?.value) window.location.href = `/compare?q=${encodeURIComponent(input.value)}`;
                  }}
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="glass-card rounded-2xl px-6 py-3 text-center">
                <div className="text-2xl md:text-3xl font-black tabular-nums">{totalSchools.toLocaleString()}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider">{t("stat.schools")}</div>
              </div>
              <div className="glass-card rounded-2xl px-6 py-3 text-center">
                <div className="text-2xl md:text-3xl font-black tabular-nums">{avgIcsea}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider">{t("stat.avgIcsea")}</div>
              </div>
              <div className="glass-card rounded-2xl px-6 py-3 text-center">
                <div className="text-2xl md:text-3xl font-black tabular-nums">{Object.keys(states).length}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider">{t("stat.states")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Showcase */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">{locale === "zh" ? "🏆 学校排名" : "🏆 School Rankings"}</h2>
            <p className="text-base-content/60 mt-1">{locale === "zh" ? "按不同维度探索澳洲最佳学校" : "Explore Australia's best schools across multiple metrics"}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <Link href="/rankings" className="ranking-card rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold">ICSEA Rankings</h3>
            <p className="text-sm text-white/75 mt-1">{locale === "zh" ? "按社区教育优势指数排名" : "Community socio-educational advantage"}</p>
            <div className="mt-4 text-sm font-semibold flex items-center gap-1">
              {locale === "zh" ? "查看排名" : "View rankings"} →
            </div>
          </Link>
          <Link href="/rankings/naplan" className="ranking-card rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-bold">NAPLAN Rankings</h3>
            <p className="text-sm text-white/75 mt-1">{locale === "zh" ? "全国统考成绩排名" : "National assessment test results"}</p>
            <div className="mt-4 text-sm font-semibold flex items-center gap-1">
              {locale === "zh" ? "查看排名" : "View rankings"} →
            </div>
          </Link>
          <Link href="/rankings/vce" className="ranking-card rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="text-lg font-bold">VCE Rankings</h3>
            <p className="text-sm text-white/75 mt-1">{locale === "zh" ? "维州高考成绩排名" : "Victorian Certificate of Education"}</p>
            <div className="mt-4 text-sm font-semibold flex items-center gap-1">
              {locale === "zh" ? "查看排名" : "View rankings"} →
            </div>
          </Link>
          <Link href="/rankings/hsc" className="ranking-card rounded-2xl p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
            <div className="text-3xl mb-3">🏅</div>
            <h3 className="text-lg font-bold">HSC Rankings</h3>
            <p className="text-sm text-white/75 mt-1">{locale === "zh" ? "新州高考成绩排名" : "Higher School Certificate"}</p>
            <div className="mt-4 text-sm font-semibold flex items-center gap-1">
              {locale === "zh" ? "查看排名" : "View rankings"} →
            </div>
          </Link>
        </div>
      </section>

      {/* States Grid */}
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-bold">{t("section.browseByState")}</h2>
          <p className="text-base-content/60 mt-1">{locale === "zh" ? "选择州或领地浏览学校" : "Select a state or territory to browse schools"}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(states)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([code, data]) => (
              <Link
                key={code}
                href={`/state/${code}`}
                className={`card card-hover cursor-pointer rounded-2xl border-0 shadow-sm ${stateCardClass[code] || "bg-base-200"}`}
              >
                <div className="card-body p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{stateEmoji[code] || "📍"}</span>
                    <div>
                      <h3 className="font-bold text-base">{stateNames[code] || code}</h3>
                      <div className="text-xs text-base-content/50 mt-0.5">{code}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-base-content/60 mt-2">
                    <span><strong className="text-base-content">{data.count.toLocaleString()}</strong> {t("schools")}</span>
                    <span><strong className="text-base-content">{data.suburbs}</strong> {t("suburbs")}</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Quick Compare CTA */}
      <section className="bg-gradient-to-r from-base-200 to-base-300 rounded-3xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          {locale === "zh" ? "⚖️ 对比学校" : "⚖️ Compare Schools Side by Side"}
        </h2>
        <p className="text-base-content/60 max-w-xl mx-auto mb-6">
          {locale === "zh"
            ? "选择最多6所学校，对比ICSEA、学生人数、师生比等关键指标"
            : "Select up to 6 schools and compare ICSEA scores, enrolments, staff ratios and more"}
        </p>
        <Link href="/compare" className="btn btn-primary btn-lg rounded-full px-8 shadow-lg">
          {locale === "zh" ? "开始对比" : "Start Comparing"} →
        </Link>
      </section>

      {/* Top 50 Schools */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">{t("section.top50")}</h2>
            <p className="text-base-content/60 mt-1">{locale === "zh" ? "按ICSEA指数排名的全澳前50名学校" : "Top 50 schools ranked by ICSEA score"}</p>
          </div>
          <Link href="/rankings" className="btn btn-outline btn-sm rounded-full">
            {locale === "zh" ? "查看全部" : "View All"} →
          </Link>
        </div>
        <div className="card bg-base-100 shadow-lg border border-base-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead className="bg-base-200/80">
                <tr>
                  <th className="w-12 text-center">#</th>
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
                    <td className="text-center">
                      {i < 3 ? (
                        <span className="text-lg">{["🥇", "🥈", "🥉"][i]}</span>
                      ) : (
                        <span className="text-base-content/40 tabular-nums font-medium">{i + 1}</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/school/${s.slug}`} className="link link-primary font-semibold hover:link-hover">
                        {schoolTypeEmoji(s.type)} {s.name}
                      </Link>
                    </td>
                    <td className="text-sm text-base-content/70">{s.suburb}, {s.state}</td>
                    <td><span className="badge badge-sm badge-outline">{s.type}</span></td>
                    <td><span className={`badge badge-sm ${sectorBadgeClass(s.sector)}`}>{s.sector}</span></td>
                    <td className={`text-right tabular-nums font-bold ${icseaColor(s.icsea)}`}>
                      {s.icsea}
                    </td>
                    <td className="text-right tabular-nums text-base-content/70">{s.enrolments.total?.toLocaleString()}</td>
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
