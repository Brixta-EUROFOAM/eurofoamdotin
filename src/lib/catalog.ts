import { gaddaProducts } from "@/lib/gadda-products";
export type MattressLayerVisual =
  | "auto"
  | "fabric"
  | "foam"
  | "zoned"
  | "core"
  | "spring"
  | "latex"
  | "memory"
  | "cool"
  | "adaptive"
  | "hd"
  | "hr";

export type MattressLayer = {
  name: string;
  description: string;
  /**
   * Transparent isolated render used by the
   * homepage construction experience.
   */
  visualAsset?: string;


  /*
   * Optional engineering data.
   * Leave blank rather than inventing a specification.
   */
  material?: string;
  thickness?: string;
  density?: string;
  technicalNote?: string;

  /*
   * Controls the material visualization used by the homepage
   * cinematic sequence. "auto" infers it from the layer name.
   */
  visualKind?: MattressLayerVisual;
};

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
  /* main image (shop cards, link previews, first photo) */
  image: string;
  /* extra product photos, in order */
  gallery?: string[];
  /* auto-made gallery slides to show (undefined = all): inside, trial, sizes, delivery */
  slides?: ("cutaway" | "inside" | "trial" | "sizes" | "delivery")[];
  /* trial stamp in the corner of photos (default on) */
  photoBadge?: boolean;
  accent: string;
  features: string[];
  layers: MattressLayer[];
  /* group/length/width: see src/lib/sizes.ts (e.g. Queen 75 × 60 in) */
  sizes: { label: string; priceAdd: number; group?: string; length?: number; width?: number }[];
  heights: { label: string; priceAdd: number }[];
  /* Upgrades like "pocket springs instead of HR foam". */
  options?: MattressOption[];
};

export type MattressOptionChoice = {
  label: string;
  priceAdd: number;
  note?: string;
  /* Replaces one layer in the stack when chosen (index into layers). */
  swap?: { index: number; layer: MattressLayer };
};

export type MattressOption = {
  id: string;
  label: string;
  choices: MattressOptionChoice[];
};

/* The layer stack after applying the chosen upgrades. */
export function layersWithChoices(
  mattress: Mattress,
  picked: Record<string, string> = {}
): MattressLayer[] {
  const layers = [...mattress.layers];
  for (const option of mattress.options || []) {
    const choice = option.choices.find((c) => c.label === picked[option.id]);
    if (choice?.swap && layers[choice.swap.index]) {
      layers[choice.swap.index] = choice.swap.layer;
    }
  }
  return layers;
}


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
    label: "Call GADDA",
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


export type HeroSlide = {
  id: string;

  /**
   * High-resolution full-bleed banner image.
   * Recommended master: 3200x1800 or 3840x2160.
   */
  image: string;

  imageAlt?: string;

  /**
   * The ENTIRE slide links here.
   */
  href: string;

  eyebrow?: string;
  title: string;
  body?: string;
  ctaLabel?: string;

  /**
   * light = white copy over darker imagery
   * dark  = black copy over lighter imagery
   */
  textTone?: "light" | "dark";

  /**
   * left or center content composition.
   */
  contentAlign?: "left" | "center";

  /**
   * CSS object-position, e.g. "50% 50%" or "70% 50%".
   */
  imagePosition?: string;

  enabled?: boolean;
};


export type HomeTrustItem = {
  id: string;
  value: string;
  title: string;
  body?: string;
};

export type NewArrivalsSettings = {
  enabled?: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
  productSlugs?: string[];
};

export type LayerStorySettings = {
  enabled?: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
  productSlug?: string;
};

export type HomeBanner = {
  id: string;
  enabled?: boolean;
  eyebrow?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  href: string;
  image?: string;
  imagePosition?: string;
  theme?: "light" | "dark";
};

export type HomeSectionVisibility = {
  hero?: boolean;
  layerStory?: boolean;
  newArrivals?: boolean;
  shopByRooms?: boolean;
  promos?: boolean;
  productGrid?: boolean;
  sleepQuiz?: boolean;
  reviews?: boolean;
};

export type SiteSettings = {
  announcementEnabled?: boolean;
  announcementHref?: string;
  announcementBackground?: string;
  announcementForeground?: string;

  /*
   * Homepage base appearance.
   */
  homeBackground?: string;
  homeForeground?: string;

  trustItems?: HomeTrustItem[];

  newArrivals?: NewArrivalsSettings;
  layerStory?: LayerStorySettings;
  homeBanners?: HomeBanner[];
  homeSections?: HomeSectionVisibility;
  heroSlides?: HeroSlide[];
  homeStoryProductSlug?: string;
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
  /* custom size rules + measuring guide (src/lib/sizes.ts) */
  sizing?: Partial<import("@/lib/sizes").Sizing>;
  /* FAQ shown on home, contact and product pages. Answers may contain [text](/link). Empty = defaults. */
  faqs?: { q: string; a: string }[];
  /* editable headings and lines on the homepage (see src/lib/site-copy.ts) */
  copy?: Record<string, string>;
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
    brandName: "GADDA",
    brandSuffix: "MATTRESSES",
    tagline: "Gadda hi hai yaar.",
    logoUrl: "/eurofoam-logo-v2.png",
    announcement: "FREE SHIPPING · EASY TRIALS · WARRANTY INCLUDED",
    homeBackground: "#000000",
    homeForeground: "#FFFFFF",
    heroEyebrow: "GADDA MATTRESSES",
    heroTitle: "Buy a Mattress, not ==Bullsh#*t.==",
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
  products: gaddaProducts,
  reviews: []
};

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}
