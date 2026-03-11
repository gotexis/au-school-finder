#!/usr/bin/env python3
"""Process ACARA XLSX data into JSON for the school finder site."""

import json
import os
import openpyxl
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
OUT_DIR = Path(__file__).parent.parent / "src" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def read_xlsx(filename, sheet_name):
    wb = openpyxl.load_workbook(DATA_DIR / filename, read_only=True)
    ws = wb[sheet_name]
    rows = list(ws.rows)
    headers = [c.value for c in rows[0]]
    data = []
    for row in rows[1:]:
        record = {}
        for h, c in zip(headers, row):
            record[h] = c.value
        data.append(record)
    wb.close()
    return data

def process_schools():
    print("Reading school profiles...")
    profiles = read_xlsx("school_profile_2025.xlsx", "SchoolProfile 2025")
    print(f"  {len(profiles)} schools")

    print("Reading school locations...")
    locations = read_xlsx("school_location_2025.xlsx", "SchoolLocations 2025")
    loc_map = {}
    for loc in locations:
        key = loc.get("ACARA SML ID")
        if key:
            loc_map[key] = {
                "latitude": loc.get("Latitude"),
                "longitude": loc.get("Longitude"),
                "sa4_name": loc.get("SA4 Name"),
                "lga_name": loc.get("LGA Name"),
                "remoteness": loc.get("Remoteness Area"),
            }
    print(f"  {len(loc_map)} locations")

    print("Reading enrolments by grade...")
    enrolments = read_xlsx("enrolments_by_grade_2025.xlsx", "EnrolmentsByGrade 2025")
    enrol_map = {}
    for e in enrolments:
        key = e.get("ACARA SML ID")
        if key:
            grades = {}
            for k, v in e.items():
                if k and ("Grade" in str(k) or "Year" in str(k) or "Prep" in str(k) or "Kindergarten" in str(k) or "Ungraded" in str(k)):
                    if k not in ("Calendar Year", "Year Range"):
                        grades[k] = v
            enrol_map[key] = grades
    print(f"  {len(enrol_map)} enrolment records")

    # Merge all data
    schools = []
    for p in profiles:
        sid = p.get("ACARA SML ID")
        if not sid or not p.get("School Name"):
            continue

        slug = f"{p['School Name'].lower().replace(' ', '-').replace('/', '-').replace('&', 'and').replace(',', '').replace('.', '').replace('(', '').replace(')', '')}-{p.get('Postcode', '')}"
        # Remove consecutive hyphens
        while '--' in slug:
            slug = slug.replace('--', '-')
        slug = slug.strip('-')

        school = {
            "id": sid,
            "slug": slug,
            "name": p["School Name"],
            "suburb": p.get("Suburb", ""),
            "state": p.get("State", ""),
            "postcode": str(p.get("Postcode", "")),
            "sector": p.get("School Sector", ""),
            "type": p.get("School Type", ""),
            "yearRange": p.get("Year Range", ""),
            "url": p.get("School URL", ""),
            "governingBody": p.get("Governing Body", ""),
            "geolocation": p.get("Geolocation", ""),
            "icsea": p.get("ICSEA"),
            "icseaPercentile": p.get("ICSEA Percentile"),
            "seaQuarters": {
                "bottom": p.get("Bottom SEA Quarter (%)"),
                "lowerMiddle": p.get("Lower Middle SEA Quarter (%)"),
                "upperMiddle": p.get("Upper Middle SEA Quarter (%)"),
                "top": p.get("Top SEA Quarter (%)"),
            },
            "staff": {
                "teaching": p.get("Teaching Staff"),
                "teachingFTE": p.get("Full Time Equivalent Teaching Staff"),
                "nonTeaching": p.get("Non-Teaching Staff"),
                "nonTeachingFTE": p.get("Full Time Equivalent Non-Teaching Staff"),
            },
            "enrolments": {
                "total": p.get("Total Enrolments"),
                "girls": p.get("Girls Enrolments"),
                "boys": p.get("Boys Enrolments"),
                "fte": p.get("Full Time Equivalent Enrolments"),
                "indigenous": p.get("Indigenous Enrolments (%)"),
                "lbote": p.get("Language Background Other Than English - Yes (%)"),
            },
        }

        # Add location data
        loc = loc_map.get(sid, {})
        school["latitude"] = loc.get("latitude")
        school["longitude"] = loc.get("longitude")
        school["lga"] = loc.get("lga_name", "")
        school["sa4"] = loc.get("sa4_name", "")

        # Add grade enrolments
        school["gradeEnrolments"] = enrol_map.get(sid, {})

        schools.append(school)

    print(f"Merged {len(schools)} schools")

    # Write full data
    with open(OUT_DIR / "schools.json", "w") as f:
        json.dump(schools, f)
    print(f"Wrote {OUT_DIR / 'schools.json'}")

    # Build indexes
    states = {}
    suburbs = {}
    postcodes = {}
    for s in schools:
        state = s["state"]
        if state not in states:
            states[state] = {"count": 0, "suburbs": set()}
        states[state]["count"] += 1
        states[state]["suburbs"].add(s["suburb"])

        suburb_key = f"{s['suburb']}-{s['state']}".lower().replace(' ', '-')
        if suburb_key not in suburbs:
            suburbs[suburb_key] = {"name": s["suburb"], "state": s["state"], "postcode": s["postcode"], "schools": []}
        suburbs[suburb_key]["schools"].append({"id": s["id"], "slug": s["slug"], "name": s["name"], "type": s["type"], "sector": s["sector"], "icsea": s["icsea"], "enrolments": s["enrolments"]["total"]})

        pc = s["postcode"]
        if pc not in postcodes:
            postcodes[pc] = []
        postcodes[pc].append(s["id"])

    # Serialize states
    state_index = {k: {"count": v["count"], "suburbs": len(v["suburbs"])} for k, v in states.items()}
    with open(OUT_DIR / "states.json", "w") as f:
        json.dump(state_index, f)

    # Serialize suburbs
    suburb_list = {k: {"name": v["name"], "state": v["state"], "postcode": v["postcode"], "count": len(v["schools"])} for k, v in suburbs.items()}
    with open(OUT_DIR / "suburbs.json", "w") as f:
        json.dump(suburb_list, f)

    # Write suburb detail files
    suburb_dir = OUT_DIR / "suburbs"
    suburb_dir.mkdir(exist_ok=True)
    for k, v in suburbs.items():
        with open(suburb_dir / f"{k}.json", "w") as f:
            json.dump(v, f)

    print(f"States: {len(state_index)}, Suburbs: {len(suburb_list)}")
    print("Done!")

if __name__ == "__main__":
    process_schools()
