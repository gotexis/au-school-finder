import { getStates, getSchools } from "@/lib/schools";
import { HomeContent } from "@/components/HomeContent";

export default function Home() {
  const states = getStates();
  const schools = getSchools();
  const totalSchools = schools.length;
  const avgIcsea = Math.round(
    schools.filter((s) => s.icsea).reduce((a, s) => a + (s.icsea || 0), 0) /
      schools.filter((s) => s.icsea).length
  );

  const top50 = schools
    .filter((s) => s.icsea)
    .sort((a, b) => (b.icsea || 0) - (a.icsea || 0))
    .slice(0, 50);

  return (
    <HomeContent
      states={states}
      top50={JSON.parse(JSON.stringify(top50))}
      totalSchools={totalSchools}
      avgIcsea={avgIcsea}
    />
  );
}
