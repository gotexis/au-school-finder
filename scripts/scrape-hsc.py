#!/usr/bin/env python3.13
"""Scrape HSC school rankings from BetterEducation using Crawl4AI."""
import asyncio, json, re, os

JS_SHOW_100 = '''
(async () => {
    const sel = document.querySelector('select[name="ctl00_ContentPlaceHolder1_GridView1_length"], select[name*="_length"]');
    if (sel) {
        sel.value = '100';
        sel.dispatchEvent(new Event('change'));
    }
    await new Promise(r => setTimeout(r, 2000));
})();
'''

JS_NEXT_PAGE = '''
(async () => {
    const next = document.querySelector('#ctl00_ContentPlaceHolder1_GridView1_next');
    if (next) next.click();
    await new Promise(r => setTimeout(r, 2000));
})();
'''

def parse_table(html):
    table_match = re.search(r'<table[^>]*id="ctl00_ContentPlaceHolder1_GridView1"[^>]*>(.*?)</table>', html, re.DOTALL)
    if not table_match:
        return []
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table_match.group(1), re.DOTALL)
    schools = []
    for row in rows[1:]:
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        if len(cells) < 10:
            continue
        clean = lambda x: re.sub(r'<[^>]+>', '', x).strip()
        rank_str = clean(cells[0])
        if not rank_str.isdigit():
            continue
        locality = clean(cells[11]) if len(cells) > 11 else ''
        loc_parts = locality.split(',')
        schools.append({
            'rank': int(rank_str),
            'name': clean(cells[2]),
            'pctTopBands': clean(cells[3]).replace('%', ''),
            'students': clean(cells[4]),
            'examsSat': clean(cells[5]),
            'distinguishedAchievers': clean(cells[6]),
            'category': clean(cells[9]),
            'region': clean(cells[10]),
            'suburb': loc_parts[0].strip() if loc_parts else '',
            'state': loc_parts[1].strip() if len(loc_parts) > 1 else 'NSW',
            'postcode': loc_parts[2].strip() if len(loc_parts) > 2 else '',
        })
    return schools

async def main():
    from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
    
    all_schools = []
    async with AsyncWebCrawler() as crawler:
        # Page 1: show 100
        config1 = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, js_code=JS_SHOW_100, page_timeout=30000)
        result = await crawler.arun('https://bettereducation.com.au/results/hsc.aspx', config=config1)
        page1 = parse_table(result.html)
        all_schools.extend(page1)
        print(f"Page 1: {len(page1)} schools")
        
        # Page 2: next page
        config2 = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, js_code=JS_SHOW_100 + JS_NEXT_PAGE, page_timeout=30000)
        result2 = await crawler.arun('https://bettereducation.com.au/results/hsc.aspx', config=config2)
        page2 = parse_table(result2.html)
        # Filter out duplicates
        existing_ranks = {s['rank'] for s in all_schools}
        page2_new = [s for s in page2 if s['rank'] not in existing_ranks]
        all_schools.extend(page2_new)
        print(f"Page 2: {len(page2_new)} new schools")
    
    all_schools.sort(key=lambda x: x['rank'])
    print(f"Total: {len(all_schools)} schools")
    for s in all_schools[:3]:
        print(f"  #{s['rank']} {s['name']} — {s['pctTopBands']}%")
    
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'data', 'hsc-rankings.json')
    with open(out_path, 'w') as f:
        json.dump(all_schools, f, indent=2)
    print(f"Saved to {out_path}")

asyncio.run(main())
