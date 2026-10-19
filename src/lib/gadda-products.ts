import type { Mattress } from "@/lib/catalog";

/*
  THE GADDA LINE-UP — three mattresses, plain names, real materials.

  Prices, upgrade prices and firmness labels are starting values: change
  them in Admin → Products once they're final. Thickness of each layer is
  left blank on purpose — fill it in from the factory spec sheet rather
  than guessing (the site shows it automatically once it's filled).
*/

const COVER = {
  name: "Fabric cover",
  description: "Stitched fabric outer. Keeps everything inside where it belongs.",
  material: "Quilted fabric",
  thickness: "",
  density: "",
  technicalNote: "",
  visualKind: "fabric" as const,
};

const SIZES = (step: number) => [
  { label: "Single", priceAdd: 0 },
  { label: "Double", priceAdd: step },
  { label: "Queen", priceAdd: Math.round(step * 1.8) },
  { label: "King", priceAdd: Math.round(step * 2.6) },
];

const HEIGHTS = (step: number) => [
  { label: "6 inch", priceAdd: 0 },
  { label: "8 inch", priceAdd: step },
];

/* Product photos shipped with the site (public/products/…). Replace or add more in Admin → Products → Photos. */
export const REGULAR_PHOTOS = [
  "/products/gadda-regular/layers.webp",
  "/products/gadda-regular/bedroom.webp",
  "/products/gadda-regular/top-view.webp",
  "/products/gadda-regular/reading.webp",
  "/products/gadda-regular/sitting.webp",
  "/products/gadda-regular/label-closeup.webp",
];

export const PRO_PHOTOS = [
  "/products/gadda-pro/layers.webp",
  "/products/gadda-pro/bedroom.webp",
  "/products/gadda-pro/top-view.webp",
  "/products/gadda-pro/front.webp",
  "/products/gadda-pro/side.webp",
  "/products/gadda-pro/closeup.webp",
];

export const ULTIMATE_PHOTOS = [
  "/products/gadda-ultimate/layers.webp",
  "/products/gadda-ultimate/bedroom.webp",
  "/products/gadda-ultimate/label-closeup.webp",
  "/products/gadda-ultimate/corner-closeup.webp",
];

/* photo sets that ship with the site, by product */
export const SHIPPED_PHOTOS: Record<string, string[]> = {
  "gadda-regular": REGULAR_PHOTOS,
  "gadda-pro": PRO_PHOTOS,
  "gadda-ultimate": ULTIMATE_PHOTOS,
};

export const gaddaProducts: Mattress[] = [
  {
    slug: "gadda-regular",
    name: "Gadda Regular",
    kicker: "The honest basic",
    badge: "REGULAR",
    category: "Regular",
    shortDescription: "Soft on top, firm underneath. Everything a good mattress needs, nothing it doesn't.",
    longDescription:
      "Two foams, one job. A soft comfort layer so it doesn't feel like sleeping on a table, on top of a high-density foam base that keeps you supported night after night. For guest rooms, first homes, hostels, and anyone who just wants a proper gadda.",
    basePrice: 6990,
    compareAt: 6990,
    firmness: "Firm-ish",
    rating: 0,
    reviews: 0,
    trial: "100-night trial",
    warranty: "Warranty included",
    image: REGULAR_PHOTOS[0],
    gallery: REGULAR_PHOTOS.slice(1),
    // the layers photo already explains what's inside, so skip the drawn cutaway/breakdown here
    slides: ["trial", "sizes", "delivery"],
    accent: "from-[#F3ECDD] to-[#FF6500]",
    features: ["HD foam support base", "Soft foam comfort layer", "Firm, steady feel", "Best value in the line-up"],
    layers: [
      COVER,
      {
        name: "Soft foam",
        description: "The comfortable bit on top. Takes the hard edge off.",
        material: "Soft PU foam",
        thickness: "",
        density: "",
        technicalNote: "",
        visualKind: "foam",
      },
      {
        name: "HD foam",
        description: "High-density foam base. Firm and steady, so you don't sink.",
        material: "High-density foam",
        thickness: "",
        density: "HD",
        technicalNote: "",
        visualKind: "hd",
      },
    ],
    sizes: SIZES(2000),
    heights: HEIGHTS(1800),
  },
  {
    slug: "gadda-pro",
    name: "Gadda Pro",
    kicker: "The one most people should buy",
    badge: "PRO",
    category: "Pro",
    shortDescription: "Memory foam comfort on a 32-density HR foam base. Or swap the base for pocket springs.",
    longDescription:
      "Memory foam moulds to you and takes pressure off shoulders and hips. Soft foam sits between it and a 32-density high-resilience (HR) foam base that springs back fast and holds you level. Prefer bounce? Choose pocket springs instead of the HR base.",
    basePrice: 11990,
    compareAt: 11990,
    firmness: "Balanced",
    rating: 0,
    reviews: 0,
    trial: "100-night trial",
    warranty: "Warranty included",
    image: PRO_PHOTOS[0],
    gallery: PRO_PHOTOS.slice(1),
    // the layers photo already explains what's inside
    slides: ["trial", "sizes", "delivery"],
    accent: "from-[#F3ECDD] to-[#FF6500]",
    features: ["Memory foam pressure relief", "32D HR foam base", "Pocket-spring option", "Balanced feel for most sleepers"],
    layers: [
      COVER,
      {
        name: "Memory foam",
        description: "Moulds to your shape. Takes pressure off shoulders and hips.",
        material: "Memory foam",
        thickness: "",
        density: "",
        technicalNote: "",
        visualKind: "memory",
      },
      {
        name: "Soft foam",
        description: "Transition layer, so you settle in without sinking through.",
        material: "Soft PU foam",
        thickness: "",
        density: "",
        technicalNote: "",
        visualKind: "foam",
      },
      {
        name: "32D HR foam",
        description: "High-resilience foam, 32 density. Springs back fast and keeps your spine level.",
        material: "High-resilience (HR) foam",
        thickness: "",
        density: "32D",
        technicalNote: "",
        visualKind: "hr",
      },
    ],
    options: [
      {
        id: "core",
        label: "Support base",
        choices: [
          { label: "32D HR foam", priceAdd: 0, note: "Quiet, solid, no bounce." },
          {
            label: "Pocket springs",
            priceAdd: 1500,
            note: "Bouncier and airier.",
            swap: {
              index: 3,
              layer: {
                name: "Pocket springs",
                description: "Individually wrapped springs. More bounce, more airflow, less partner disturbance.",
                material: "Pocket spring unit",
                thickness: "",
                density: "",
                technicalNote: "",
                visualKind: "spring",
              },
            },
          },
        ],
      },
    ],
    sizes: SIZES(2600),
    heights: HEIGHTS(2400),
  },
  {
    slug: "gadda-ultimate",
    name: "Gadda Ultimate",
    kicker: "Every upgrade, no gimmicks",
    badge: "ULTIMATE",
    category: "Ultimate",
    shortDescription: "Natural latex and adaptive foam on our densest 40D HR base. Our most advanced support.",
    longDescription:
      "Natural latex on top: breathable, responsive and long-lasting, with real pressure relief. Adaptive foam underneath responds as you move, so you never feel stuck. All of it on a 40-density HR foam base, the most supportive core we make.",
    basePrice: 18990,
    compareAt: 18990,
    firmness: "Plush-supportive",
    rating: 0,
    reviews: 0,
    trial: "100-night trial",
    warranty: "Warranty included",
    image: ULTIMATE_PHOTOS[0],
    gallery: ULTIMATE_PHOTOS.slice(1),
    // the layers photo already explains what's inside
    slides: ["trial", "sizes", "delivery"],
    accent: "from-[#F3ECDD] to-[#FF6500]",
    features: ["Natural latex comfort layer", "Adaptive foam layer", "40D HR foam base", "Breathable, washable AeroTex cover"],
    layers: [
      {
        ...COVER,
        name: "Breathable AeroTex cover",
        description: "Soft, skin-friendly, breathable and washable. Stays fresh.",
      },
      {
        name: "Natural latex",
        description: "Breathable, responsive and durable. Real pressure relief with natural bounce.",
        material: "Natural latex",
        thickness: "",
        density: "",
        technicalNote: "",
        visualKind: "latex",
      },
      {
        name: "Adaptive foam",
        description: "Responds to your body as you move, so you never feel stuck in one spot.",
        material: "Adaptive foam",
        thickness: "",
        density: "",
        technicalNote: "",
        visualKind: "adaptive",
      },
      {
        name: "40D HR foam",
        description: "High-resilience foam, 40 density. Our densest, most supportive base.",
        material: "High-resilience (HR) foam",
        thickness: "",
        density: "40D",
        technicalNote: "",
        visualKind: "hr",
      },
    ],
    sizes: SIZES(3400),
    heights: HEIGHTS(3000),
  },
];
