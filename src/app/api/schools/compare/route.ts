import { getSchools } from "@/lib/schools";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const slugs = req.nextUrl.searchParams.get("slugs")?.split(",").filter(Boolean);
  if (!slugs || slugs.length === 0) return NextResponse.json([]);

  const schools = getSchools();
  const results = slugs
    .map((slug) => schools.find((s) => s.slug === slug))
    .filter(Boolean);

  return NextResponse.json(results);
}
