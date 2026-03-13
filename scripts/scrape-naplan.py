#!/usr/bin/env python3.13
"""
Scrape NAPLAN school-level results from MySchool.edu.au using Crawl4AI.

MySchool requires Terms of Use acceptance (cookie-based). This script:
1. Accepts ToU on first visit
2. Scrapes NAPLAN results for each school by ACARA ID
3. Outputs naplan-results.json

Usage:
  # Sample run (10 schools, for testing):
  python3.13 scripts/scrape-naplan.py --sample 10

  # Full run (all ~9700 schools, takes ~4-5 hours):
  python3.13 scripts/scrape-naplan.py

  # Resume from where we left off:
  python3.13 scripts/scrape-naplan.py --resume

Data source: https://myschool.edu.au/school/{ACARA_ID}/naplan/results
"""
import asyncio, json, re, os, sys, argparse
from pathlib import Path

SCHOOLS_PATH = Path(__file__).parent.parent / "src/data/schools.json"
OUTPUT_PATH = Path(__file__).parent / "data/naplan-results.json"

# JS to accept MySchool Terms of Use
JS_ACCEPT_TOU = '''
(async () => {
    const checkbox = document.querySelector('input[type="checkbox"]');
    if (checkbox && !checkbox.checked) {
        checkbox.click();
        await new Promise(r => setTimeout(r, 500));
    }
    const btn = document.querySelector('input[value="Accept"], button:has-text("Accept")');
    if (btn) {
        btn.click();
        await new Promise(r => setTimeout(r, 2000));
    }
})();
'''

def parse_naplan_page(html: str, school_id: int) -> dict | None:
    """Extract NAPLAN results from a MySchool school NAPLAN page."""
    # Look for NAPLAN data tables - they contain year level, domain, and scores
    results = {}
    
    # Pattern: year levels (3, 5, 7, 9) × domains (Reading, Writing, Spelling, Grammar, Numeracy)
    domains = ["Reading", "Writing", "Spelling", "Grammar and Punctuation", "Numeracy"]
    year_levels = ["3", "5", "7", "9"]
    
    # Try to find score data in the HTML
    # MySchool renders NAPLAN as tables with school average vs national average
    
    # Look for JSON data embedded in the page (MySchool uses React/client rendering)
    json_matches = re.findall(r'window\.__NEXT_DATA__\s*=\s*({.*?})\s*;', html)
    if json_matches:
        try:
            data = json.loads(json_matches[0])
            # Navigate the Next.js data structure
            props = data.get("props", {}).get("pageProps", {})
            if props:
                results["_raw"] = props
                return results
        except json.JSONDecodeError:
            pass
    
    # Fallback: parse tables for score data
    # Look for patterns like "School average: 520" or similar score displays
    score_patterns = re.findall(
        r'(?:school\s+(?:average|mean|score)[:\s]*)([\d.]+)',
        html, re.IGNORECASE
    )
    if score_patterns:
        results["raw_scores"] = [float(s) for s in score_patterns]
    
    # Extract any structured data from data attributes
    data_attrs = re.findall(r'data-naplan[^=]*="([^"]*)"', html)
    if data_attrs:
        results["data_attrs"] = data_attrs
    
    # Look for proficiency level data
    proficiency = re.findall(
        r'(Exceeding|Strong|Developing|Needs additional support)[^<]*?([\d.]+)%',
        html, re.IGNORECASE
    )
    if proficiency:
        results["proficiency"] = {level: float(pct) for level, pct in proficiency}
    
    return results if results else None


async def scrape_naplan(sample: int = 0, resume: bool = False):
    """Main scraping function."""
    try:
        from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
    except ImportError:
        print("ERROR: crawl4ai not installed. Run: pip install crawl4ai")
        sys.exit(1)
    
    with open(SCHOOLS_PATH) as f:
        schools = json.load(f)
    
    if sample > 0:
        schools = schools[:sample]
    
    # Load existing results if resuming
    existing = {}
    if resume and OUTPUT_PATH.exists():
        with open(OUTPUT_PATH) as f:
            existing = {r["id"]: r for r in json.load(f)}
        print(f"Loaded {len(existing)} existing results")
    
    # Filter out already-scraped schools
    if resume:
        schools = [s for s in schools if s["id"] not in existing]
    
    print(f"Scraping NAPLAN for {len(schools)} schools...")
    
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    browser_config = BrowserConfig(
        headless=True,
        verbose=False,
    )
    
    results = list(existing.values())
    
    async with AsyncWebCrawler(config=browser_config) as crawler:
        # First: accept ToU
        print("Accepting MySchool Terms of Use...")
        tou_config = CrawlerRunConfig(
            js_code=JS_ACCEPT_TOU,
            wait_for="css:input[type='checkbox']",
        )
        await crawler.arun("https://myschool.edu.au", config=tou_config)
        print("ToU accepted.")
        
        # Scrape each school
        for i, school in enumerate(schools):
            url = f"https://myschool.edu.au/school/{school['id']}/naplan/results"
            try:
                config = CrawlerRunConfig(
                    wait_for="css:.naplan-results, css:.school-naplan, css:table",
                )
                result = await crawler.arun(url, config=config)
                
                if result.success:
                    naplan = parse_naplan_page(result.html, school["id"])
                    if naplan:
                        naplan["id"] = school["id"]
                        naplan["name"] = school["name"]
                        results.append(naplan)
                        print(f"  [{i+1}/{len(schools)}] ✅ {school['name']}: {len(naplan)} fields")
                    else:
                        print(f"  [{i+1}/{len(schools)}] ⚠️ {school['name']}: no NAPLAN data found")
                else:
                    print(f"  [{i+1}/{len(schools)}] ❌ {school['name']}: {result.error_message}")
                
                # Save periodically
                if (i + 1) % 50 == 0:
                    with open(OUTPUT_PATH, "w") as f:
                        json.dump(results, f)
                    print(f"  💾 Saved {len(results)} results")
                    
            except Exception as e:
                print(f"  [{i+1}/{len(schools)}] ❌ {school['name']}: {e}")
            
            # Rate limit: don't hammer the server
            await asyncio.sleep(1)
    
    # Final save
    with open(OUTPUT_PATH, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n✅ Done! {len(results)} schools with NAPLAN data saved to {OUTPUT_PATH}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape NAPLAN results from MySchool")
    parser.add_argument("--sample", type=int, default=0, help="Number of schools to sample (0=all)")
    parser.add_argument("--resume", action="store_true", help="Resume from existing data")
    args = parser.parse_args()
    
    asyncio.run(scrape_naplan(sample=args.sample, resume=args.resume))
