"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "en" | "zh";

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    // Nav & Layout
    "site.name": "AU School Finder",
    "site.short": "Schools",
    "nav.compare": "⚖️ Compare",
    "nav.rankings": "🏆 Rankings",
    "nav.states": "States",

    // Hero
    "hero.title": "Find the Right School",
    "hero.desc.pre": "Compare ",
    "hero.desc.mid": " Australian schools with official ACARA data. ICSEA rankings, enrolment stats, staff ratios, and more.",
    "stat.schools": "Schools",
    "stat.schools.desc": "Across all states",
    "stat.avgIcsea": "Avg ICSEA",
    "stat.avgIcsea.desc": "National average",
    "stat.states": "States",
    "stat.states.desc": "& territories",

    // Sections
    "section.browseByState": "Browse by State",
    "section.top50": "Top 50 Schools by ICSEA",
    "section.naplanBanner": "NAPLAN Rankings",
    "schools": "schools",
    "suburbs": "suburbs",

    // Table
    "table.rank": "#",
    "table.school": "School",
    "table.location": "Location",
    "table.type": "Type",
    "table.sector": "Sector",
    "table.icsea": "ICSEA",
    "table.students": "Students",

    // Footer
    "footer.desc": "Helping Australian parents find the right school. Compare ICSEA rankings, enrolments, and staff data for 9,700+ schools.",
    "footer.browseByState": "Browse by State",
    "footer.dataSource": "Data Source",
    "footer.dataSourceDesc": "All data sourced from the",
    "footer.acara": "ACARA Data Access Program",
    "footer.languages": "🌏 Languages",
    "footer.langDesc": "English & 中文 available. العربية (Arabic) coming 2026 — serving Australia's multicultural families.",
    "footer.copyright": "Not affiliated with ACARA or the Australian Government.",

    // School detail
    "school.overview": "Overview",
    "school.enrolments": "Enrolments",
    "school.staff": "Staff",
    "school.nearby": "Nearby Schools (within 5km)",
    "school.sea": "Socio-Educational Advantage",
    "school.distance": "Distance",
    "school.yearRange": "Year Range",
    "school.totalStudents": "Total Students",
    "school.staffRatio": "Student-Staff Ratio",
    "school.icsea": "ICSEA Score",
    "school.percentile": "Percentile",
    "school.map": "Map",

    // Rankings
    "rankings.title": "School Rankings",
    "rankings.naplan": "NAPLAN Rankings",
    "rankings.vce": "VCE Rankings",
    "rankings.hsc": "HSC Rankings",
    "rankings.byIcsea": "By ICSEA",
    "rankings.beta": "Beta",

    // Compare
    "compare.title": "Compare Schools",
    "compare.search": "Search schools to compare...",
    "compare.add": "Add school",
    "compare.clear": "Clear all",

    // Common
    "loading": "Loading...",
    "noResults": "No results found",
    "viewAll": "View All",
  },
  zh: {
    // Nav & Layout
    "site.name": "澳洲择校助手",
    "site.short": "择校",
    "nav.compare": "⚖️ 对比",
    "nav.rankings": "🏆 排名",
    "nav.states": "州/领地",

    // Hero
    "hero.title": "找到合适的学校",
    "hero.desc.pre": "对比 ",
    "hero.desc.mid": " 所澳大利亚学校的官方 ACARA 数据。ICSEA 排名、入学统计、师生比等。",
    "stat.schools": "学校",
    "stat.schools.desc": "覆盖所有州",
    "stat.avgIcsea": "平均 ICSEA",
    "stat.avgIcsea.desc": "全国均值",
    "stat.states": "州/领地",
    "stat.states.desc": "含领地",

    // Sections
    "section.browseByState": "按州浏览",
    "section.top50": "ICSEA 排名前50学校",
    "section.naplanBanner": "NAPLAN 排名",
    "schools": "所学校",
    "suburbs": "个社区",

    // Table
    "table.rank": "#",
    "table.school": "学校",
    "table.location": "所在地",
    "table.type": "类型",
    "table.sector": "办学性质",
    "table.icsea": "ICSEA",
    "table.students": "学生数",

    // Footer
    "footer.desc": "帮助澳大利亚家长找到合适的学校。对比 9,700+ 所学校的 ICSEA 排名、入学人数和师资数据。",
    "footer.browseByState": "按州浏览",
    "footer.dataSource": "数据来源",
    "footer.dataSourceDesc": "所有数据来自",
    "footer.acara": "ACARA 数据访问计划",
    "footer.languages": "🌏 语言",
    "footer.langDesc": "支持 English 和中文。العربية（阿拉伯语）即将推出 — 服务澳大利亚多元文化家庭。",
    "footer.copyright": "与 ACARA 和澳大利亚政府无关。",

    // School detail
    "school.overview": "概览",
    "school.enrolments": "入学人数",
    "school.staff": "师资",
    "school.nearby": "附近学校（5公里内）",
    "school.sea": "社会教育优势",
    "school.distance": "距离",
    "school.yearRange": "年级范围",
    "school.totalStudents": "学生总数",
    "school.staffRatio": "师生比",
    "school.icsea": "ICSEA 分数",
    "school.percentile": "百分位",
    "school.map": "地图",

    // Rankings
    "rankings.title": "学校排名",
    "rankings.naplan": "NAPLAN 排名",
    "rankings.vce": "VCE 排名",
    "rankings.hsc": "HSC 排名",
    "rankings.byIcsea": "按 ICSEA",
    "rankings.beta": "测试版",

    // Compare
    "compare.title": "学校对比",
    "compare.search": "搜索学校进行对比...",
    "compare.add": "添加学校",
    "compare.clear": "清除全部",

    // Common
    "loading": "加载中...",
    "noResults": "未找到结果",
    "viewAll": "查看全部",
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("locale");
      if (saved === "zh" || saved === "en") return saved;
      // Auto-detect Chinese browsers
      if (navigator.language.startsWith("zh")) return "zh";
    }
    return "en";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", l);
      document.documentElement.lang = l;
    }
  }, []);

  const t = useCallback(
    (key: string) => dictionaries[locale][key] || dictionaries.en[key] || key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-1">
        🌏 {locale === "en" ? "EN" : "中文"}
      </div>
      <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-32 p-2 shadow-lg">
        <li>
          <button onClick={() => setLocale("en")} className={locale === "en" ? "active" : ""}>
            🇦🇺 English
          </button>
        </li>
        <li>
          <button onClick={() => setLocale("zh")} className={locale === "zh" ? "active" : ""}>
            🇨🇳 中文
          </button>
        </li>
      </ul>
    </div>
  );
}
