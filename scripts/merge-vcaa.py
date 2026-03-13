#!/usr/bin/env python3
"""Merge VCAA VCE scores with main school data using fuzzy matching."""
import json
from difflib import SequenceMatcher

schools = json.load(open('src/data/schools.json'))
vce = json.load(open('src/data/vce-scores.json'))

vic = {s['id']: s for s in schools if s['state'] == 'VIC'}

def normalize(name):
    return name.lower().replace("'", "").replace(".", "").replace("-", " ").strip()

# Build lookup by normalized name
vic_by_name = {}
for s in vic.values():
    vic_by_name[normalize(s['name'])] = s

matched = []
unmatched = []

for v in vce:
    vn = normalize(v['name'])
    loc = v['locality'].lower()
    
    # Exact match
    if vn in vic_by_name:
        s = vic_by_name[vn]
        matched.append({**v, 'schoolId': s['id'], 'slug': s['slug'], 'suburb': s['suburb'], 'postcode': s['postcode'], 'icsea': s.get('icsea')})
        continue
    
    # Fuzzy match within same locality
    best_score = 0
    best_match = None
    for s in vic.values():
        if s['suburb'].lower() == loc or loc in s['suburb'].lower():
            ratio = SequenceMatcher(None, vn, normalize(s['name'])).ratio()
            if ratio > best_score:
                best_score = ratio
                best_match = s
    
    if best_score >= 0.6:
        s = best_match
        matched.append({**v, 'schoolId': s['id'], 'slug': s['slug'], 'suburb': s['suburb'], 'postcode': s['postcode'], 'icsea': s.get('icsea')})
    else:
        # Try fuzzy across all VIC schools
        for s in vic.values():
            ratio = SequenceMatcher(None, vn, normalize(s['name'])).ratio()
            if ratio > best_score:
                best_score = ratio
                best_match = s
        if best_score >= 0.7:
            s = best_match
            matched.append({**v, 'schoolId': s['id'], 'slug': s['slug'], 'suburb': s['suburb'], 'postcode': s['postcode'], 'icsea': s.get('icsea')})
        else:
            unmatched.append(v)

matched.sort(key=lambda s: s['medianStudyScore'] or 0, reverse=True)

print(f"Matched: {len(matched)}/{len(vce)}, Unmatched: {len(unmatched)}")
if unmatched:
    print("Unmatched schools:", [u['name'] for u in unmatched[:10]])

with open('src/data/vce-rankings.json', 'w') as f:
    json.dump(matched, f, indent=2)

print(f"Saved {len(matched)} schools to src/data/vce-rankings.json")
