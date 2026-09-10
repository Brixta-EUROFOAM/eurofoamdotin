export type Mattress = {
  slug: string;
  name: string;
  kicker: string;
  badge?: string;
  category: "Ortho" | "Cooling" | "Hybrid" | "Essential" | string;
  shortDescription: string;
  longDescription: string;
  basePrice: number;
  compareAt: number;
  firmness: string;
  rating: number;
  reviews: number;
  trial: string;
  warranty: string;
  image: string;
  accent: string;
  features: string[];
  layers: { name: string; description: string }[];
  sizes: { label: string; priceAdd: number }[];
  heights: { label: string; priceAdd: number }[];
};


export type HeaderUtilityIcon =
  | "none"
  | "phone"
  | "heart"
  | "account"
  | "store"
  | "dealer"
  | "bulk";

export type HeaderUtility = {
  id: string;
  label: string;
  href: string;
  icon: HeaderUtilityIcon;
  presentation: "text" | "icon";
  enabled: boolean;
};

export const defaultHeaderUtilities: HeaderUtility[] = [
  {
    id: "dealer",
    label: "Become Dealer",
    href: "/dealer",
    icon: "dealer",
    presentation: "text",
    enabled: false
  },
  {
    id: "stores",
    label: "Stores",
    href: "/stores",
    icon: "store",
    presentation: "text",
    enabled: false
  },
  {
    id: "bulk",
    label: "Bulk Orders",
    href: "/bulk-orders",
    icon: "bulk",
    presentation: "text",
    enabled: false
  },
  {
    id: "phone",
    label: "Call Eurofoam",
    href: "tel:",
    icon: "phone",
    presentation: "icon",
    enabled: true
  },
  {
    id: "wishlist",
    label: "Wishlist",
    href: "/wishlist",
    icon: "heart",
    presentation: "icon",
    enabled: true
  },
  {
    id: "account",
    label: "Account",
    href: "/account",
    icon: "account",
    presentation: "icon",
    enabled: true
  }
];

export type SiteSettings = {
  brandName: string;
  brandSuffix: string;
  tagline: string;
  logoUrl: string;
  announcement: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroImage: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  email: string;
  phone: string;
  headerUtilities?: HeaderUtility[];
};

export type Review = {
  id: string;
  stars: number;
  quote: string;
  name: string;
  product: string;
};

export type StoreData = {
  site: SiteSettings;
  products: Mattress[];
  reviews: Review[];
};

export const defaultStoreData: StoreData = {
  site: {
    brandName: "EUROFOAM",
    brandSuffix: "MATTRESSES",
    tagline: "Keep the world at rest",
    logoUrl: "/eurofoam-logo-v2.png",
    announcement: "FREE SHIPPING · EASY TRIALS · WARRANTY INCLUDED",
    heroEyebrow: "EUROFOAM MATTRESSES",
    heroTitle: "A better mattress shouldn't need a showroom.",
    heroBody:
      "Clear comfort choices, transparent construction and direct-to-your-door convenience. Choose the feel that fits you and try it where sleep actually happens: at home.",
    heroImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=90",
    primaryCtaLabel: "SHOP MATTRESSES",
    secondaryCtaLabel: "FIND MY MATCH",
    email: "care@eurofoam.example",
    phone: "+91 00000 00000",
    headerUtilities: defaultHeaderUtilities
  },
  products: [
    {
      slug: "euro-align",
      name: "Euro Align",
      kicker: "Everyday orthopedic support",
      badge: "BESTSELLER",
      category: "Ortho",
      shortDescription:
        "Balanced pressure relief and structured support for everyday sleep.",
      longDescription:
        "Euro Align is the medium-firm all-rounder: responsive comfort on top, stable support below and enough airflow to keep the surface from feeling stuffy.",
      basePrice: 11990,
      compareAt: 17990,
      firmness: "Medium Firm · 7/10",
      rating: 4.8,
      reviews: 2841,
      trial: "100-night trial",
      warranty: "10-year warranty",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85",
      accent: "from-[#f6ead0] to-[#ead49e]",
      features: [
        "Zoned support architecture",
        "Pressure-relieving comfort foam",
        "Motion isolation for couples",
        "Breathable knitted cover"
      ],
      layers: [
        { name: "AirKnit Cover", description: "Soft-touch breathable top fabric." },
        { name: "Relief Foam", description: "Contours without a deep sink." },
        { name: "Support Grid Foam", description: "Zoned response through the torso and hips." },
        { name: "Stability Core", description: "Dense base foam for edge-to-edge support." }
      ],
      sizes: [
        { label: "Single", priceAdd: 0 },
        { label: "Double", priceAdd: 2500 },
        { label: "Queen", priceAdd: 4500 },
        { label: "King", priceAdd: 6500 }
      ],
      heights: [
        { label: "6 inch", priceAdd: 0 },
        { label: "8 inch", priceAdd: 2400 },
        { label: "10 inch", priceAdd: 4800 }
      ]
    },
    {
      slug: "euro-air",
      name: "Euro Air",
      kicker: "Cooling comfort",
      badge: "COOLEST",
      category: "Cooling",
      shortDescription:
        "A cooler-feel mattress built around ventilation and fast heat release.",
      longDescription:
        "Euro Air uses an open-cell comfort layer and ventilated transition layer to reduce heat build-up while preserving a supportive, medium-firm feel.",
      basePrice: 15490,
      compareAt: 22990,
      firmness: "Medium Firm · 6.5/10",
      rating: 4.7,
      reviews: 1736,
      trial: "100-night trial",
      warranty: "10-year warranty",
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85",
      accent: "from-[#e7f1f4] to-[#cfe3e9]",
      features: [
        "Cool-touch top fabric",
        "Open-cell comfort layer",
        "Ventilated transition foam",
        "Low-motion transfer"
      ],
      layers: [
        { name: "CoolTouch Cover", description: "Smooth surface engineered for a cooler first touch." },
        { name: "AirCell Foam", description: "Open-cell comfort with faster heat dispersion." },
        { name: "Vent Layer", description: "Channelled transition foam for airflow." },
        { name: "Stability Core", description: "Firm base layer for long-term structure." }
      ],
      sizes: [
        { label: "Single", priceAdd: 0 },
        { label: "Double", priceAdd: 2900 },
        { label: "Queen", priceAdd: 5100 },
        { label: "King", priceAdd: 7300 }
      ],
      heights: [
        { label: "6 inch", priceAdd: 0 },
        { label: "8 inch", priceAdd: 2800 },
        { label: "10 inch", priceAdd: 5200 }
      ]
    },
    {
      slug: "euro-float",
      name: "Euro Float",
      kicker: "Hybrid bounce + support",
      badge: "HOTEL FEEL",
      category: "Hybrid",
      shortDescription:
        "Pocket springs, responsive foam and reinforced edges for a buoyant sleep feel.",
      longDescription:
        "Euro Float is designed for sleepers who dislike the stuck-in-foam feeling. Individually wrapped springs deliver bounce and separation, while foam layers soften pressure points.",
      basePrice: 18990,
      compareAt: 27990,
      firmness: "Balanced · 6/10",
      rating: 4.9,
      reviews: 1244,
      trial: "100-night trial",
      warranty: "12-year warranty",
      image:
        "https://images.unsplash.com/photo-1616627981212-9d22b0fd8d2e?auto=format&fit=crop&w=1200&q=85",
      accent: "from-[#f3eee5] to-[#e2d4be]",
      features: [
        "Individually wrapped pocket springs",
        "Reinforced perimeter support",
        "Responsive comfort foam",
        "Reduced partner disturbance"
      ],
      layers: [
        { name: "CloudWeave Cover", description: "Plush woven top for a hotel-inspired finish." },
        { name: "Responsive Foam", description: "Fast response without excessive sink." },
        { name: "Micro-Transition Layer", description: "Buffers pressure above the spring unit." },
        { name: "Pocket Spring Core", description: "Independent movement and buoyant support." }
      ],
      sizes: [
        { label: "Single", priceAdd: 0 },
        { label: "Double", priceAdd: 3500 },
        { label: "Queen", priceAdd: 6000 },
        { label: "King", priceAdd: 8500 }
      ],
      heights: [
        { label: "8 inch", priceAdd: 0 },
        { label: "10 inch", priceAdd: 3500 },
        { label: "12 inch", priceAdd: 6500 }
      ]
    },
    {
      slug: "euro-easy",
      name: "Euro Easy",
      kicker: "Simple. Supportive. Affordable.",
      category: "Essential",
      shortDescription:
        "A clean two-layer foam mattress for guest rooms, rentals and first homes.",
      longDescription:
        "Euro Easy keeps the build straightforward: a comfort layer for surface softness and a dense support base underneath.",
      basePrice: 6990,
      compareAt: 9990,
      firmness: "Medium Firm · 7/10",
      rating: 4.6,
      reviews: 908,
      trial: "30-night trial",
      warranty: "7-year warranty",
      image:
        "https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?auto=format&fit=crop&w=1200&q=85",
      accent: "from-[#f7f3ed] to-[#eee6d8]",
      features: [
        "Two-layer construction",
        "Removable knitted cover",
        "Firm support base",
        "Roll-packed delivery"
      ],
      layers: [
        { name: "SoftKnit Cover", description: "Simple washable outer cover." },
        { name: "Comfort Foam", description: "Moderate cushioning for everyday use." },
        { name: "Support Base", description: "Dense base foam for structure." }
      ],
      sizes: [
        { label: "Single", priceAdd: 0 },
        { label: "Double", priceAdd: 1600 },
        { label: "Queen", priceAdd: 2900 },
        { label: "King", priceAdd: 4400 }
      ],
      heights: [
        { label: "5 inch", priceAdd: 0 },
        { label: "6 inch", priceAdd: 1200 },
        { label: "8 inch", priceAdd: 3000 }
      ]
    }
  ],
  reviews: [
    {
      id: "review-1",
      stars: 5,
      quote:
        "I wanted support without the rock-hard orthopedic feel. The medium-firm balance is exactly what I was looking for.",
      name: "Demo customer · Bengaluru",
      product: "Euro Align"
    },
    {
      id: "review-2",
      stars: 5,
      quote:
        "The buying process was cleaner than a showroom. Picked size, understood the layers and ordered in minutes.",
      name: "Demo customer · Mumbai",
      product: "Euro Air"
    },
    {
      id: "review-3",
      stars: 5,
      quote:
        "The hybrid has proper bounce without waking my partner every time I turn.",
      name: "Demo customer · Gurugram",
      product: "Euro Float"
    }
  ]
};

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}
