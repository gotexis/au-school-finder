export function icseaColor(icsea: number | null): string {
  if (!icsea) return "";
  if (icsea >= 1100) return "icsea-excellent";
  if (icsea >= 1000) return "icsea-good";
  if (icsea >= 900) return "icsea-average";
  return "icsea-low";
}

export function schoolTypeEmoji(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("primary")) return "🏫";
  if (t.includes("secondary")) return "🎓";
  if (t.includes("combined")) return "📚";
  if (t.includes("special")) return "⭐";
  return "🏫";
}

export function sectorBadgeClass(sector: string): string {
  switch (sector) {
    case "Government": return "badge-primary";
    case "Catholic": return "badge-secondary";
    case "Independent": return "badge-accent";
    default: return "badge-ghost";
  }
}
