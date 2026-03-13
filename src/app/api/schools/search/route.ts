import { NextRequest, NextResponse } from "next/server";
import { getSchools } from "@/lib/schools";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const schools = getSchools();
  const results = schools
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.suburb.toLowerCase().includes(q)
    )
    .slice(0, 20)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      suburb: s.suburb,
      state: s.state,
      type: s.type,
      sector: s.sector,
      icsea: s.icsea,
    }));

  return NextResponse.json(results);
}
