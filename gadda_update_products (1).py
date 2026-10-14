#!/usr/bin/env python3
"""GADDA D2C: put the new line-up and copy into the LIVE store.

Run on the server, after the new build is up:   python3 gadda_update_products.py
- Backs up the live store.json next to this script first.
- Replaces products with Gadda Regular / Pro / Ultimate (with options).
- Removes the placeholder reviews.
- Points old product links (euro-*) at the new pages.
- Updates the announcement bar and the "10 year warranty" proof line.
- Keeps every other setting you changed in admin.
"""
import json, subprocess, sys, time

CONTAINER = sys.argv[1] if len(sys.argv) > 1 else "eurofoam-mattresses"
PATH = "/app/data/store.json"
OLD = {"euro-easy": "gadda-regular", "euro-align": "gadda-pro", "euro-float": "gadda-pro", "euro-air": "gadda-ultimate"}
ANNOUNCEMENT = "100 NIGHTS TO DECIDE · DELIVERY INCLUDED · NO FAKE MRP"

PRODUCTS = json.loads(r"""[
 {
  "slug": "gadda-regular",
  "name": "Gadda Regular",
  "kicker": "The honest basic",
  "badge": "REGULAR",
  "category": "Regular",
  "shortDescription": "Soft on top, firm underneath. Everything a good mattress needs, nothing it doesn't.",
  "longDescription": "Two foams, one job. A soft comfort layer so it doesn't feel like sleeping on a table, on top of a high-density foam base that keeps you supported night after night. For guest rooms, first homes, hostels, and anyone who just wants a proper gadda.",
  "basePrice": 6990,
  "compareAt": 6990,
  "firmness": "Firm-ish",
  "rating": 0,
  "reviews": 0,
  "trial": "100-night trial",
  "warranty": "Warranty included",
  "image": "/media/1789122018422-a-mattress-on-a-wooden-floor-in-a-bedroom-photo.jpg",
  "accent": "from-[#F3ECDD] to-[#FF6500]",
  "features": [
   "HD foam support base",
   "Soft foam comfort layer",
   "Firm, steady feel",
   "Best value in the line-up"
  ],
  "layers": [
   {
    "name": "Fabric cover",
    "description": "Stitched fabric outer. Keeps everything inside where it belongs.",
    "material": "Quilted fabric",
    "thickness": "",
    "density": "",
    "technicalNote": "",
    "visualKind": "fabric"
   },
   {
    "name": "Soft foam",
    "description": "The comfortable bit on top. Takes the hard edge off.",
    "material": "Soft PU foam",
    "thickness": "",
    "density": "",
    "technicalNote": "",
    "visualKind": "foam"
   },
   {
    "name": "HD foam",
    "description": "High-density foam base. Firm and steady, so you don't sink.",
    "material": "High-density foam",
    "thickness": "",
    "density": "HD",
    "technicalNote": "",
    "visualKind": "hd"
   }
  ],
  "sizes": [
   {
    "label": "Single",
    "priceAdd": 0
   },
   {
    "label": "Double",
    "priceAdd": 2000
   },
   {
    "label": "Queen",
    "priceAdd": 3600
   },
   {
    "label": "King",
    "priceAdd": 5200
   }
  ],
  "heights": [
   {
    "label": "6 inch",
    "priceAdd": 0
   },
   {
    "label": "8 inch",
    "priceAdd": 1800
   }
  ]
 },
 {
  "slug": "gadda-pro",
  "name": "Gadda Pro",
  "kicker": "The one most people should buy",
  "badge": "PRO",
  "category": "Pro",
  "shortDescription": "Memory foam comfort on a 32-density HR foam base. Or swap the base for pocket springs.",
  "longDescription": "Memory foam moulds to you and takes pressure off shoulders and hips. Soft foam sits between it and a 32-density high-resilience (HR) foam base that springs back fast and holds you level. Prefer bounce? Choose pocket springs instead of the HR base.",
  "basePrice": 11990,
  "compareAt": 11990,
  "firmness": "Balanced",
  "rating": 0,
  "reviews": 0,
  "trial": "100-night trial",
  "warranty": "Warranty included",
  "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85",
  "accent": "from-[#F3ECDD] to-[#FF6500]",
  "features": [
   "Memory foam pressure relief",
   "32D HR foam base",
   "Pocket-spring option",
   "Balanced feel for most sleepers"
  ],
  "layers": [
   {
    "name": "Fabric cover",
    "description": "Stitched fabric outer. Keeps everything inside where it belongs.",
    "material": "Quilted fabric",
    "thickness": "",
    "density": "",
    "technicalNote": "",
    "visualKind": "fabric"
   },
   {
    "name": "Memory foam",
    "description": "Moulds to your shape. Takes pressure off shoulders and hips.",
    "material": "Memory foam",
    "thickness": "",
    "density": "",
    "technicalNote": "",
    "visualKind": "memory"
   },
   {
    "name": "Soft foam",
    "description": "Transition layer, so you settle in without sinking through.",
    "material": "Soft PU foam",
    "thickness": "",
    "density": "",
    "technicalNote": "",
    "visualKind": "foam"
   },
   {
    "name": "32D HR foam",
    "description": "High-resilience foam, 32 density. Springs back fast and keeps your spine level.",
    "material": "High-resilience (HR) foam",
    "thickness": "",
    "density": "32D",
    "technicalNote": "",
    "visualKind": "hr"
   }
  ],
  "options": [
   {
    "id": "core",
    "label": "Support base",
    "choices": [
     {
      "label": "32D HR foam",
      "priceAdd": 0,
      "note": "Quiet, solid, no bounce."
     },
     {
      "label": "Pocket springs",
      "priceAdd": 1500,
      "note": "Bouncier and airier.",
      "swap": {
       "index": 3,
       "layer": {
        "name": "Pocket springs",
        "description": "Individually wrapped springs. More bounce, more airflow, less partner disturbance.",
        "material": "Pocket spring unit",
        "thickness": "",
        "density": "",
        "technicalNote": "",
        "visualKind": "spring"
       }
      }
     }
    ]
   }
  ],
  "sizes": [
   {
    "label": "Single",
    "priceAdd": 0
   },
   {
    "label": "Double",
    "priceAdd": 2600
   },
   {
    "label": "Queen",
    "priceAdd": 4680
   },
   {
    "label": "King",
    "priceAdd": 6760
   }
  ],
  "heights": [
   {
    "label": "6 inch",
    "priceAdd": 0
   },
   {
    "label": "8 inch",
    "priceAdd": 2400
   }
  ]
 },
 {
  "slug": "gadda-ultimate",
  "name": "Gadda Ultimate",
  "kicker": "Every upgrade, no gimmicks",
  "badge": "ULTIMATE",
  "category": "Ultimate",
  "shortDescription": "Cool memory foam and adaptive foam on our densest 40D HR base. Latex upgrade available.",
  "longDescription": "Cool memory foam on top so you don't wake up warm. Adaptive foam underneath responds as you move, so you never feel stuck. All of it on a 40-density HR foam base, the most supportive core we make. Prefer natural bounce? Upgrade the top layer to latex.",
  "basePrice": 18990,
  "compareAt": 18990,
  "firmness": "Plush-supportive",
  "rating": 0,
  "reviews": 0,
  "trial": "100-night trial",
  "warranty": "Warranty included",
  "image": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85",
  "accent": "from-[#F3ECDD] to-[#FF6500]",
  "features": [
   "Cool memory foam top",
   "Adaptive foam layer",
   "40D HR foam base",
   "Latex upgrade option"
  ],
  "layers": [
   {
    "name": "Fabric cover",
    "description": "Stitched fabric outer. Keeps everything inside where it belongs.",
    "material": "Quilted fabric",
    "thickness": "",
    "density": "",
    "technicalNote": "",
    "visualKind": "fabric"
   },
   {
    "name": "Cool memory foam",
    "description": "Memory foam made to sleep cooler. For the Garmi-mein-bhi crowd.",
    "material": "Cooling memory foam",
    "thickness": "",
    "density": "",
    "technicalNote": "",
    "visualKind": "cool"
   },
   {
    "name": "Adaptive foam",
    "description": "Reacts as you move, so you never feel stuck in one spot.",
    "material": "Adaptive foam",
    "thickness": "",
    "density": "",
    "technicalNote": "",
    "visualKind": "adaptive"
   },
   {
    "name": "40D HR foam",
    "description": "High-resilience foam, 40 density. Our densest, most supportive base.",
    "material": "High-resilience (HR) foam",
    "thickness": "",
    "density": "40D",
    "technicalNote": "",
    "visualKind": "hr"
   }
  ],
  "options": [
   {
    "id": "comfort",
    "label": "Top layer",
    "choices": [
     {
      "label": "Cool memory foam",
      "priceAdd": 0,
      "note": "Slow, hugging, sleeps cool."
     },
     {
      "label": "Latex",
      "priceAdd": 4000,
      "note": "Bouncy, breathable, long-lasting.",
      "swap": {
       "index": 1,
       "layer": {
        "name": "Latex",
        "description": "Latex instead of memory foam. More bounce, breathes better.",
        "material": "Latex",
        "thickness": "",
        "density": "",
        "technicalNote": "",
        "visualKind": "latex"
       }
      }
     }
    ]
   }
  ],
  "sizes": [
   {
    "label": "Single",
    "priceAdd": 0
   },
   {
    "label": "Double",
    "priceAdd": 3400
   },
   {
    "label": "Queen",
    "priceAdd": 6120
   },
   {
    "label": "King",
    "priceAdd": 8840
   }
  ],
  "heights": [
   {
    "label": "6 inch",
    "priceAdd": 0
   },
   {
    "label": "8 inch",
    "priceAdd": 3000
   }
  ]
 }
]""")

def run(*cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"Failed: {' '.join(cmd)}\n{r.stderr.strip()}")
    return r.stdout

stamp = time.strftime("%Y%m%d-%H%M%S")
backup = f"store.backup-{stamp}.json"
run("docker", "cp", f"{CONTAINER}:{PATH}", backup)
print("Backed up live data to", backup)

data = json.load(open(backup, encoding="utf-8"))
data["products"] = PRODUCTS
data["reviews"] = []
site = data.setdefault("site", {})
site["homeStoryProductSlug"] = "gadda-pro"
site["announcement"] = ANNOUNCEMENT

def fix(href):
    if isinstance(href, str):
        for old, new in OLD.items():
            href = href.replace(f"/mattresses/{old}", f"/mattresses/{new}")
    return href

for slide in site.get("heroSlides", []) or []:
    slide["href"] = fix(slide.get("href"))
camp = site.get("campaignHero")
if isinstance(camp, dict):
    camp["ctaHref"] = fix(camp.get("ctaHref"))
    if camp.get("productSlug") in OLD:
        camp["productSlug"] = OLD[camp["productSlug"]]
    if isinstance(camp.get("proof"), list):
        camp["proof"] = ["WARRANTY INCLUDED" if "10 YEAR" in str(p).upper() else p for p in camp["proof"]]

new_file = f"store.new-{stamp}.json"
json.dump(data, open(new_file, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
run("docker", "cp", new_file, f"{CONTAINER}:{PATH}")
print("Live store updated:", ", ".join(p["name"] for p in PRODUCTS))
print("Reload the site. To undo:  docker cp", backup, f"{CONTAINER}:{PATH}")
