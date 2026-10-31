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
/* same cover as the Ultimate; the layers photo shows what's different inside */
export const REGULAR_PHOTOS = [
  "/products/gadda-regular/v4-layers.webp",
  "/products/gadda-regular/v3-bed-angle.webp",
  "/products/gadda-regular/v3-bed-front.webp",
  "/products/gadda-regular/v3-bed-top.webp",
  "/products/gadda-regular/v3-label.webp",
];

/* exact photo orders shipped in earlier versions (bedroom first). Only these are upgraded to the
   current order — any order you set in Admin (e.g. "Make main") is left alone. */
export const PREVIOUS_ORDERS: Record<string, string[][]> = {
  "gadda-pro": [["bedroom", "layers", "top-view", "front", "side", "closeup"].map((n) => `/products/gadda-pro/${n}.webp`)],
  "gadda-ultimate": [
    ["bedroom", "layers", "label-closeup", "corner-closeup"].map((n) => `/products/gadda-ultimate/${n}.webp`),
    ["layers", "bedroom", "label-closeup", "corner-closeup"].map((n) => `/products/gadda-ultimate/${n}.webp`),
  ],
};

/* earlier main photos: a saved product still showing one of these gets the current main photo
   (its other photos are kept). A main photo you upload yourself in Admin is never replaced. */
export const OLD_MAIN_PHOTOS: Record<string, string[]> = {
  "gadda-regular": ["layers", "v2-layers", "v3-layers"].map((n) => `/products/gadda-regular/${n}.webp`),
};

/* photos that shipped in earlier versions — replaced automatically by the current set */
export const LEGACY_PHOTOS: Record<string, string[]> = {
  "gadda-regular": [
    ...["layers", "bedroom", "top-view", "reading", "sitting", "label-closeup"],
    ...["v2-layers", "v2-bed-angle", "v2-bed-front", "v2-bed-sunlight", "v2-label", "v2-corner"],
  ].map((n) => `/products/gadda-regular/${n}.webp`),
};

/* same cover as the other two (studio shots shared with the Ultimate); the pocket-spring
   version of the layers photo shows when someone picks that upgrade (see option-photos.ts) */
export const PRO_PHOTOS = [
  "/products/gadda-pro/v4-layers.webp",
  "/products/gadda-ultimate/studio-angle.webp",
  "/products/gadda-ultimate/studio-front.webp",
  "/products/gadda-ultimate/label-closeup.webp",
  "/products/gadda-pro/v4-bed-corner.webp",
];

/* Shop-card pictures (homepage, mattress list, menu): the whole layer stack in the wide card frame. */
export const SHIPPED_CARDS: Record<string, string> = {
  "gadda-regular": "/products/gadda-regular/v4-card.webp",
  "gadda-pro": "/products/gadda-pro/v4-card.webp",
  "gadda-ultimate": "/products/gadda-ultimate/v4-card.webp",
};

/* A new photo set that replaces whatever the saved product shows, once. After that, anything you
   change in Admin → Products → Photos sticks. Change the value to roll out another new set. */
export const PHOTO_RELEASE: Record<string, string> = {
  "gadda-pro": "pro-2026-10-studio",
};

/* studio set: layers first, then the outside from three angles and the label up close.
   The latex version of the layers photo shows when someone picks that upgrade (see option-photos.ts). */
export const ULTIMATE_PHOTOS = [
  "/products/gadda-ultimate/layers.webp",
  "/products/gadda-ultimate/studio-angle.webp",
  "/products/gadda-ultimate/studio-front.webp",
  "/products/gadda-ultimate/studio-top.webp",
  "/products/gadda-ultimate/label-closeup.webp",
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
    cardImage: SHIPPED_CARDS["gadda-regular"],
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
    cardImage: SHIPPED_CARDS["gadda-pro"],
    photoSet: PHOTO_RELEASE["gadda-pro"],
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
    shortDescription: "Cool memory foam and adaptive foam on our densest 40D HR base. Natural latex upgrade available.",
    longDescription:
      "Cool memory foam on top moulds to your shape and is made to sleep cooler than regular memory foam. Adaptive foam underneath responds as you move, so you never feel stuck. All of it on a 40-density HR foam base, the most supportive core we make. Prefer natural bounce? Swap the top layer for natural latex.",
    basePrice: 18990,
    compareAt: 18990,
    firmness: "Plush-supportive",
    rating: 0,
    reviews: 0,
    trial: "100-night trial",
    warranty: "Warranty included",
    image: ULTIMATE_PHOTOS[0],
    gallery: ULTIMATE_PHOTOS.slice(1),
    cardImage: SHIPPED_CARDS["gadda-ultimate"],
    // the layers photo already explains what's inside
    slides: ["trial", "sizes", "delivery"],
    accent: "from-[#F3ECDD] to-[#FF6500]",
    features: ["Cool memory foam comfort layer", "Adaptive foam layer", "40D HR foam base", "Breathable, washable AeroTex cover"],
    layers: [
      {
        ...COVER,
        name: "Breathable AeroTex cover",
        description: "Soft, skin-friendly, breathable and washable. Stays fresh.",
      },
      {
        name: "Cool memory foam",
        description: "Moulds to your shape. Made to sleep cooler than regular memory foam.",
        material: "Cooling memory foam",
        thickness: "",
        density: "",
        technicalNote: "",
        visualKind: "cool",
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
    options: [
      {
        id: "comfort",
        label: "Top layer",
        choices: [
          { label: "Cool memory foam", priceAdd: 0, note: "Slow, hugging, sleeps cooler." },
          {
            label: "Natural latex",
            priceAdd: 4000,
            note: "Bouncier and breathable.",
            swap: {
              index: 1,
              layer: {
                name: "Natural latex",
                description: "Breathable, responsive and durable. Real pressure relief with natural bounce.",
                material: "Natural latex",
                thickness: "",
                density: "",
                technicalNote: "",
                visualKind: "latex",
              },
            },
          },
        ],
      },
    ],
    sizes: SIZES(3400),
    heights: HEIGHTS(3000),
  },
];
