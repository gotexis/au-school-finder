#!/usr/bin/env python3.13
"""
Scrape NAPLAN-based school rankings from BetterEducation.com.au using Crawl4AI.

BetterEducation ranks schools by NAPLAN performance (their "State Overall Score").
We scrape primary + secondary for all states, then merge with our schools.json.

Usage:
  python3.13 scripts/scrape-naplan-be.py          # Full scrape, all states
  python3.13 scripts/scrape-naplan-be.py --sample  # NSW only (test)

Output: scripts/data/naplan-rankings.json
"""
import asyncio, json, re, sys, argparse
from pathlib import Path

SCHOOLS_PATH = Path(__file__).parent.parent / "src/data/schools.json"
OUTPUT_PATH = Path(__file__).parent / "data/naplan-rankings.json"

# BetterEducation URLs by state and level
URLS = {
    "NSW": {
        "Primary": "https://bettereducation.com.au/school/Primary/nsw/nsw_top_primary_schools.aspx",
        "Secondary": "https://bettereducation.com.au/school/Secondary/nsw/nsw_top_secondary_schools.aspx",
    },
    "VIC": {
        "Primary": "https://bettereducation.com.au/school/Primary/vic/vic_top_primary_schools.aspx",
        "Secondary": "https://bettereducation.com.au/school/Secondary/vic/vic_top_secondary_schools.aspx",
    },
    "QLD": {
        "Primary": "https://bettereducation.com.au/school/Primary/qld/qld_top_primary_schools.aspx",
        "Secondary": "https://bettereducation.com.au/school/Secondary/qld/qld_top_secondary_schools.aspx",
    },
    "SA": {
        "Primary": "https://bettereducation.com.au/school/Primary/sa/sa_top_primary_schools.aspx",
        "Secondary": "https://bettereducation.com.au/school/Secondary/sa/sa_top_secondary_schools.aspx",
    },
    "WA": {
        "Primary": "https://bettereducation.com.au/school/Primary/wa/wa_top_primary_schools.aspx",
        "Secondary": "https://bettereducation.com.au/school/Secondary/wa/wa_top_secondary_schools.aspx",
    },
    "TAS": {
        "Primary": "https://bettereducation.com.au/school/Primary/tas/tas_top_primary_schools.aspx",
        "Secondary": "https://bettereducation.com.au/school/Secondary/tas/tas_top_secondary_schools.aspx",
    },
    "ACT": {
        "Primary": "https://bettereducation.com.au/school/Primary/act/act_top_primary_schools.aspx",
        "Secondary": "https://bettereducation.com.au/school/Secondary/act/act_top_secondary_schools.aspx",
    },
    "NT": {
        "Primary": "https://bettereducation.com.au/school/Primary/nt/nt_top_primary_schools.aspx",
        "Secondary": "https://bettereducation.com.au/school/Secondary/nt/nt_top_secondary_schools.aspx",
    },
}

JS_SHOW_100 = '''
(async () => {
    const sel = document.querySelector('select[name*="_length"]');
    if (sel) {
        sel.value = '100';
        sel.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 3000));
    }
})();
'''

JS_NEXT_PAGE = '''
(async () => {
    const next = document.querySelector('#ctl00_ContentPlaceHolder1_GridView1_next');
    if (next && !next.classList.contains('disabled')) {
        next.click();
        await new Promise(r => setTimeout(r, 3000));
        return true;
    }
    return false;
})();
'''


def parse_table(html: str, state: str, level: str) -> list[dict]:
    """Parse BetterEducation school ranking table."""
    table = re.search(
        r'<table[^>]*id="ctl00_ContentPlaceHolder1_GridView1"[^>]*>(.*?)</table>',
        html, re.DOTALL
    )
    if not table:
        return []

    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table.group(1), re.DOTALL)
    schools = []

    for row in rows:
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        if len(cells) < 10:
            continue

        # Cell 1: "School Name,Suburb,State,Postcode"
        name_cell = re.sub(r'<[^>]+>', '', cells[1]).strip()
        parts = [p.strip() for p in name_cell.split(',')]
        if len(parts) < 3:
            continue

        name = parts[0]
        suburb = parts[1]
        postcode = parts[3] if len(parts) > 3 else ""

        # Cell 2: State Overall Score (0-100)
        score_text = re.sub(r'<[^>]+>', '', cells[2]).strip()
        try:
            score = int(score_text)
        except ValueError:
            score = None

        # Cell 3: % improvement (optional)
        improve_text = re.sub(r'<[^>]+>', '', cells[3]).strip().replace('%', '')
        try:
            improvement = float(improve_text)
        except ValueError:
            improvement = None

        # Cell 6: Student count
        students_text = re.sub(r'<[^>]+>', '', cells[6]).strip().replace(',', '')
        try:
            students = int(students_text)
        except ValueError:
            students = None

        # Cell 9: Sector
        sector = re.sub(r'<[^>]+>', '', cells[9]).strip()

        # Cell 10: Star rating
        star_text = re.sub(r'<[^>]+>', '', cells[10]).strip()
        try:
            stars = int(star_text)
        except ValueError:
            stars = None

        schools.append({
            "name": name,
            "suburb": suburb,
            "state": state,
            "postcode": postcode,
            "level": level,
            "naplan_score": score,
            "improvement_pct": improvement,
            "students": students,
            "sector": sector,
            "stars": stars,
        })

    return schools


async def scrape_all(sample: bool = False):
    """Scrape all states and levels."""
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig

    states = {"NSW": URLS["NSW"]} if sample else URLS
    all_schools = []

    bc = BrowserConfig(headless=True, verbose=False)
    async with AsyncWebCrawler(config=bc) as crawler:
        for state, levels in states.items():
            for level, url in levels.items():
                print(f"Scraping {state} {level}...")
                try:
                    # Page 1: show 100 rows
                    cfg = CrawlerRunConfig(js_code=JS_SHOW_100)
                    result = await crawler.arun(url, config=cfg)

                    if not result.success:
                        print(f"  ❌ Failed: {result.error_message}")
                        continue

                    schools = parse_table(result.html, state, level)
                    page_count = len(schools)
                    
                    # Try pagination for more schools
                    page = 2
                    while page_count == 100 and page <= 30:  # safety limit
                        cfg_next = CrawlerRunConfig(js_code=JS_NEXT_PAGE)
                        result = await crawler.arun(url, config=cfg_next)
                        if not result.success:
                            break
                        new_schools = parse_table(result.html, state, level)
                        if not new_schools:
                            break
                        # Deduplicate
                        existing_names = {s["name"] for s in schools}
                        new_unique = [s for s in new_schools if s["name"] not in existing_names]
                        schools.extend(new_unique)
                        page_count = len(new_schools)
                        page += 1
                        await asyncio.sleep(0.5)
                    
                    all_schools.extend(schools)
                    print(f"  ✅ {len(schools)} schools")

                except Exception as e:
                    print(f"  ❌ Error: {e}")

                await asyncio.sleep(1)  # Be nice

    # Save
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(all_schools, f, indent=2)
    print(f"\n✅ Total: {len(all_schools)} schools saved to {OUTPUT_PATH}")

    # Stats
    by_state = {}
    for s in all_schools:
        key = f"{s['state']}-{s['level']}"
        by_state[key] = by_state.get(key, 0) + 1
    for k, v in sorted(by_state.items()):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", action="store_true", help="NSW only (test)")
    args = parser.parse_args()
    asyncio.run(scrape_all(sample=args.sample))
