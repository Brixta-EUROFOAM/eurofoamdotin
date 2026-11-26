/*
  GADDA V12 — Premium Infographic Questionnaire
  Campaign definitions, curated static editorial infographics, image-based answer cards,
  honest product positioning, and verified catalogue photography paths for all 5 ad journeys.
  Preserves existing SleepMatch recommendation scoring without automatic upselling.
*/

export type CampaignKey = "hot" | "cold" | "tired" | "restless" | "stiff";
export type MatchKey = "regular" | "pro" | "ultimate";

export type QuizOption = {
  id: string;
  focus: string;
  tag: string;
  label: string;
  hint: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  thumbnailFit?: "contain" | "cover";
  stageCaption?: string;
  score: Partial<Record<MatchKey, number>>;
  why: string;
  insight?: string;
  nonMattressNote?: {
    heading: string;
    body: string;
  };
};

export type QuizStep = {
  kind: "concern" | "position" | "feel" | "priority";
  eyebrow: string;
  title: string;
  subtitle: string;
  whyItMatters: string;
  choices: QuizOption[];
};

export type CampaignConfig = {
  key: CampaignKey;
  kicker: string;
  headline: string;
  intro: string;
  accentBg: string;
  stageEyebrow: string;
  stageBadge: string;
  infographic: string;
  infographicAlt: string;
  stageDefaultCaption: string;
  stageFooterRight: string;
  q1: QuizStep;
  positionTitle: string;
};

export const STEP_INFOGRAPHICS = {
  position: {
    src: "/sleepmatch/infographics/restless.jpg",
    alt: "Editorial illustration comparing three natural sleeping positions: side, back and stomach sleeping",
    eyebrow: "02 / SLEEPING POSTURE",
    badge: "SIDE · BACK · STOMACH",
    defaultCaption: "Where your body presses most depends on how you actually fall asleep.",
    footerRight: "Hover any position to highlight",
  },
  feel: {
    src: "/sleepmatch/infographics/feel.jpg",
    alt: "Editorial illustration comparing three mattress surface feel profiles: steady, balanced and cushioned",
    eyebrow: "03 / SURFACE FEEL",
    badge: "STEADY · BALANCED · CUSHIONED",
    defaultCaption: "Surface feel is how the top responds. Underlying support holds your body steady.",
    footerRight: "Conceptual feel comparison",
  },
} as const;

export const PRODUCT_POSITIONING: Record<
  MatchKey,
  {
    name: string;
    tagline: string;
    summary: string;
    benefits: string[];
    tradeoff: string;
    photos: {
      bedroom: string;
      layers: string;
      layersUpgrade?: string;
      upgradeMatch?: string;
      studio: string;
    };
  }
> = {
  regular: {
    name: "Gadda Regular",
    tagline: "Support. Without unnecessary extras.",
    summary:
      "A soft PU comfort layer over a steady high-density foam foundation. Straightforward construction if you prefer lying on top of the surface at a sensible price.",
    benefits: [
      "High-density foam support base for steady, even hold",
      "Soft top comfort layer that takes the hard edge off",
      "Minimal sink-in — easy to change positions",
    ],
    tradeoff:
      "Less shoulder and hip contouring than memory-foam models. No dedicated cooling-oriented comfort layer.",
    photos: {
      bedroom: "/products/gadda-regular/v2-bed-sunlight.webp",
      layers: "/products/gadda-regular/v4-layers.webp",
      studio: "/products/gadda-regular/v3-bed-angle.webp",
    },
  },
  pro: {
    name: "Gadda Pro",
    tagline: "Cushioned where you need it. Supported where it matters.",
    summary:
      "Memory foam comfort and a soft transition layer over a responsive 32D HR foam base — with an optional pocket-spring core if you prefer added bounce and airflow.",
    benefits: [
      "Memory foam comfort layer for shoulder & hip cushioning",
      "Soft transition foam above a responsive 32D HR support core",
      "Optional pocket-spring base upgrade for extra bounce and airflow",
    ],
    tradeoff:
      "Balanced rather than ultra-firm or ultra-plush. Pocket springs are an optional paid configuration.",
    photos: {
      bedroom: "/products/gadda-pro/bedroom.webp",
      layers: "/products/gadda-pro/v4-layers.webp",
      layersUpgrade: "/products/gadda-pro/v4-layers-springs.webp",
      upgradeMatch: "spring",
      studio: "/products/gadda-pro/v4-bed-corner.webp",
    },
  },
  ultimate: {
    name: "Gadda Ultimate",
    tagline: "More responsive comfort, with temperature in mind.",
    summary:
      "Cooling-oriented memory foam and adaptive foam over our densest 40D HR support base, wrapped in a breathable washable AeroTex cover — with an optional Natural Latex top swap.",
    benefits: [
      "Breathable, washable AeroTex quilted cover",
      "Cooling-oriented memory foam + responsive adaptive foam",
      "40D HR high-density support base (optional Natural Latex top)",
    ],
    tradeoff:
      "Higher price and a more plush feel. Cooling-oriented layers do not guarantee a fixed temperature drop; room temperature and bedding still matter.",
    photos: {
      bedroom: "/products/gadda-ultimate/bedroom.webp",
      layers: "/products/gadda-ultimate/layers.webp",
      layersUpgrade: "/products/gadda-ultimate/layers-latex.webp",
      upgradeMatch: "latex",
      studio: "/products/gadda-ultimate/studio-angle.webp",
    },
  },
};

const SHARED_POSITION_CHOICES: QuizOption[] = [
  {
    id: "side",
    focus: "side",
    tag: "SIDE",
    label: "On my side",
    hint: "Shoulders and hips press into the surface most.",
    thumbnail: "/sleepmatch/infographics/pos-side.jpg",
    thumbnailAlt: "Side sleeping position illustration",
    thumbnailFit: "cover",
    stageCaption: "Side sleeping concentrates contact at the shoulders and hips — gentle surface give helps.",
    score: { pro: 3, ultimate: 3 },
    why: "you mainly sleep on your side",
  },
  {
    id: "back",
    focus: "back",
    tag: "BACK",
    label: "On my back",
    hint: "Weight spreads evenly across a steadier surface.",
    thumbnail: "/sleepmatch/infographics/pos-back.jpg",
    thumbnailAlt: "Back sleeping position illustration",
    thumbnailFit: "cover",
    stageCaption: "Back sleeping distributes weight broadly, favouring even, steady hold across the torso.",
    score: { pro: 3, regular: 2 },
    why: "you mainly sleep on your back",
  },
  {
    id: "stomach",
    focus: "stomach",
    tag: "STOMACH",
    label: "On my stomach",
    hint: "Usually more comfortable with less hip sink-in.",
    thumbnail: "/sleepmatch/infographics/pos-stomach.jpg",
    thumbnailAlt: "Stomach sleeping position illustration",
    thumbnailFit: "cover",
    stageCaption: "Stomach sleeping generally prefers a flatter, firmer top so the midsection does not dip.",
    score: { regular: 4, pro: 1 },
    why: "you mainly sleep on your stomach",
  },
  {
    id: "combo",
    focus: "combo",
    tag: "MIXED",
    label: "I keep changing positions",
    hint: "Side, back, side again through the night.",
    thumbnail: "/sleepmatch/infographics/restless.jpg",
    thumbnailAlt: "Multiple sleeping positions illustration showing side, back and stomach sleeping",
    thumbnailFit: "cover",
    stageCaption: "Changing positions calls for responsive comfort that cushions your side without feeling stuck.",
    score: { pro: 3, ultimate: 1 },
    why: "you move between positions during the night",
  },
];

const SHARED_FEEL_STEP: QuizStep = {
  kind: "feel",
  eyebrow: "03 / YOUR COMFORT",
  title: "Forget foam jargon. How should the bed actually feel?",
  subtitle: "Softer isn't always more comfortable, and firmer isn't always more supportive.",
  whyItMatters:
    "Surface feel and underlying support are different jobs — this narrows down how much contouring you enjoy.",
  choices: [
    {
      id: "firm",
      focus: "firm",
      tag: "STEADY",
      label: "Steady. I like lying on top",
      hint: "A firmer surface with restrained give.",
      thumbnail: "/sleepmatch/infographics/feel-firm.jpg",
      thumbnailAlt: "Steady firm mattress surface feel cross-section",
      thumbnailFit: "cover",
      stageCaption: "Steady feel: minimal surface sink-in so you rest cleanly on top of the mattress.",
      score: { regular: 6, pro: 1 },
      why: "you prefer a steadier, on-top surface feel",
    },
    {
      id: "balanced",
      focus: "balanced",
      tag: "BALANCED",
      label: "A little give, with support underneath",
      hint: "Not too hard, not overly plush.",
      thumbnail: "/sleepmatch/infographics/feel-balanced.jpg",
      thumbnailAlt: "Balanced medium mattress surface feel cross-section",
      thumbnailFit: "cover",
      stageCaption: "Balanced feel: light top cushioning paired with a responsive high-resilience core.",
      score: { pro: 7 },
      why: "you prefer a balanced mix of cushioning and support",
    },
    {
      id: "plush",
      focus: "plush",
      tag: "CUSHIONED",
      label: "Cushioned. I like a softer hug",
      hint: "More surface contouring and plush comfort.",
      thumbnail: "/sleepmatch/infographics/feel-plush.jpg",
      thumbnailAlt: "Cushioned plush mattress surface feel cross-section",
      thumbnailFit: "cover",
      stageCaption: "Cushioned feel: deeper surface contouring above a dense 40D support foundation.",
      score: { ultimate: 7, pro: 1 },
      why: "you enjoy deeper plush cushioning",
    },
  ],
};

const SHARED_PRIORITY_STEP: QuizStep = {
  kind: "priority",
  eyebrow: "04 / WHAT IS WORTH PAYING FOR",
  title: "What would make this purchase feel right?",
  subtitle: "We don't push the most expensive build. Pick the trade-off that makes sense for you.",
  whyItMatters:
    "All three GADDA mattresses use verified foam densities — you should only pay for extra layers you actually want.",
  choices: [
    {
      id: "essential",
      focus: "essential",
      tag: "REGULAR",
      label: "Get the essentials right",
      hint: "Straightforward two-foam build at a sensible price.",
      thumbnail: "/products/gadda-regular/v4-layers.webp",
      thumbnailAlt: "Gadda Regular mattress layer cutaway photo",
      thumbnailFit: "contain",
      stageCaption: "Gadda Regular: Support. Without unnecessary extras.",
      score: { regular: 7, pro: 1 },
      why: "you prioritise straightforward value before upgrades",
    },
    {
      id: "everyday",
      focus: "everyday",
      tag: "PRO",
      label: "Get the everyday balance right",
      hint: "Memory foam comfort and responsive support for daily use.",
      thumbnail: "/products/gadda-pro/v4-layers.webp",
      thumbnailAlt: "Gadda Pro mattress layer cutaway photo",
      thumbnailFit: "contain",
      stageCaption: "Gadda Pro: Cushioned where you need it. Supported where it matters.",
      score: { pro: 7 },
      why: "you want balanced everyday cushioning and support",
    },
    {
      id: "premium",
      focus: "premium",
      tag: "ULTIMATE",
      label: "Pay more if the materials make sense",
      hint: "Open to cooling-oriented and adaptive comfort layers.",
      thumbnail: "/products/gadda-ultimate/layers.webp",
      thumbnailAlt: "Gadda Ultimate mattress layer cutaway photo",
      thumbnailFit: "contain",
      stageCaption: "Gadda Ultimate: More responsive comfort, with temperature in mind.",
      score: { ultimate: 7 },
      why: "you are open to upgraded comfort materials",
    },
  ],
};

export const CAMPAIGNS: Record<CampaignKey, CampaignConfig> = {
  hot: {
    key: "hot",
    kicker: "GADDA / THREE MATTRESSES. NO NONSENSE.",
    headline: "Your bed shouldn't feel like a heater.",
    intro:
      "Before paying for a cooling upgrade, let's separate what's coming from the mattress surface, your bedding, and the room itself.",
    accentBg: "#f5efe5",
    stageEyebrow: "GADDA / TEMPERATURE STUDY",
    stageBadge: "01 · SLEEPING HOT",
    infographic: "/sleepmatch/infographics/hot.jpg",
    infographicAlt:
      "Editorial illustration of a person feeling uncomfortably warm in bed, kicking back a duvet with restrained indicators of heat around the mattress surface",
    stageDefaultCaption:
      "Warmth builds from three places: the mattress surface, the covers above you, and room airflow.",
    stageFooterRight: "No miracle cooling claims",
    positionTitle: "Which sleeping position puts you in contact with the bed most?",
    q1: {
      kind: "concern",
      eyebrow: "01 / WHERE YOU NOTICE IT",
      title: "Where do you notice the heat?",
      subtitle: "Not every warm night is a mattress problem. Pick what feels closest.",
      whyItMatters:
        "If your duvet or room airflow is the main culprit, lighter bedding may help more than a new mattress.",
      choices: [
        {
          id: "surface",
          focus: "surface",
          tag: "SURFACE",
          label: "The mattress surface feels warm.",
          hint: "Warmth builds right where your body rests against the bed.",
          stageCaption:
            "Contact warmth points toward breathable covers and cooling-oriented top foams — though sheets and room air still matter.",
          score: { ultimate: 5 },
          why: "you notice warmth directly at the mattress surface",
          insight:
            "Cooling-oriented comfort layers and breathable covers are designed with warmth in mind, though room airflow and sheets still matter.",
        },
        {
          id: "room",
          focus: "room",
          tag: "ROOM & BEDDING",
          label: "The blanket or room feels warm.",
          hint: "The air or covers around you feel stuffy before the bed does.",
          stageCaption:
            "Heavy covers and still air often trap warmth long before the mattress does — check bedding before upgrading.",
          score: {},
          why: "room temperature and bedding may matter more than changing mattresses",
          insight:
            "We won't upsell a cooling mattress when your covers or room ventilation may be the bigger factor.",
          nonMattressNote: {
            heading: "Check your bedding & room airflow first",
            body: "Because the blanket or room feels warm, switching to breathable cotton sheets, lighter covers, or improving room ventilation may help more than replacing your mattress. If you are still choosing a bed, here is your closest match based on your comfort preferences:",
          },
        },
        {
          id: "enclosed",
          focus: "enclosed",
          tag: "SINK-IN",
          label: "I feel too enclosed by my mattress.",
          hint: "Sinking in deeply makes the bed feel close and warm.",
          stageCaption:
            "Deep sink-in wraps foam around your body. A steadier, on-top feel often feels cooler and less enclosing.",
          score: { regular: 4, pro: 2 },
          why: "you prefer less sink-in and a steadier surface",
          insight:
            "Deep, close-hugging foam wraps around more of your body. A steadier, on-top surface often feels less enclosing.",
        },
        {
          id: "unsure",
          focus: "unsure",
          tag: "COMPARE",
          label: "I'm not sure.",
          hint: "Let's compare sleeping position, feel and materials first.",
          stageCaption:
            "We'll weigh sleeping position, preferred feel and materials without pushing a cooling upgrade.",
          score: {},
          why: "you want to compare surface feel before paying for cooling extras",
          insight:
            "No guesswork needed — we'll weigh sleeping position, surface feel and priorities without forcing an upgrade.",
        },
      ],
    },
  },

  cold: {
    key: "cold",
    kicker: "GADDA / THREE MATTRESSES. NO NONSENSE.",
    headline: "Comfort shouldn't mean constantly reaching for another blanket.",
    intro:
      "Start with the layers over you and the room around you. We won't recommend a cooling mattress — or pretend a mattress treats feeling cold.",
    accentBg: "#f5efe5",
    stageEyebrow: "GADDA / BEDDING & WARMTH STUDY",
    stageBadge: "01 · WAKING UP COLD",
    infographic: "/sleepmatch/infographics/cold.jpg",
    infographicAlt:
      "Editorial illustration of a person curled comfortably under layered cotton sheets, a plush duvet and a woven throw while cool evening air drifts outside",
    stageDefaultCaption:
      "Bedding layers, fabric weight and room drafts shape perceived warmth far more than foam type.",
    stageFooterRight: "Honest bedding-first check",
    positionTitle: "What is your usual comfortable sleeping position?",
    q1: {
      kind: "concern",
      eyebrow: "01 / WHEN YOU NOTICE IT",
      title: "When does the bed feel too cold?",
      subtitle: "Let's separate room and bedding conditions from mattress surface comfort.",
      whyItMatters:
        "A mattress does not generate heat or treat cold sensitivity. Checking bedding first keeps you from spending unnecessarily.",
      choices: [
        {
          id: "first",
          focus: "first",
          tag: "SHEETS & ROOM",
          label: "Right when I get into bed",
          hint: "The sheets or room air feel chilly at first contact.",
          stageCaption:
            "Brushed cotton or flannel sheets and a warmer comforter usually fix chilly first-contact faster than changing mattresses.",
          score: {},
          why: "initial sheet and room temperature may matter most",
          insight:
            "Brushed cotton or flannel sheets and a warmer comforter usually solve cold first-contact faster than changing mattresses.",
          nonMattressNote: {
            heading: "Bedding and room layers may matter more than a new mattress",
            body: "No mattress treats cold intolerance or replaces warm bedding. Consider heavier breathable cotton layers or room insulation first. If you're also replacing your mattress, here is your best comfort-preference fit:",
          },
        },
        {
          id: "midnight",
          focus: "midnight",
          tag: "OVERNIGHT",
          label: "In the middle of the night",
          hint: "I wake up chilly even under my usual covers.",
          stageCaption:
            "Check overnight duvet insulation and drafts first — and speak with a doctor if unexplained chill persists.",
          score: {},
          why: "overnight room temperature and bedding insulation matter here",
          insight:
            "Check duvet warmth and drafts first; persistent unexplained cold sensitivity is best discussed with a healthcare professional.",
          nonMattressNote: {
            heading: "Check overnight bedding before replacing your mattress",
            body: "Waking up cold is typically driven by room temperature, drafts, or duvet insulation rather than mattress construction. If you still want to compare our three builds by feel, here is your closest fit:",
          },
        },
        {
          id: "surface-comfort",
          focus: "surface",
          tag: "SURFACE FEEL",
          label: "The mattress itself also feels uncomfortable",
          hint: "I want a more comfortable surface feel alongside better bedding.",
          stageCaption:
            "We'll shortlist by sleeping position and preferred surface feel — never pushing cooling upgrades you don't need.",
          score: { pro: 2 },
          why: "you want to improve overall mattress surface comfort",
          insight:
            "We'll focus on your sleeping position and preferred cushioning — never pushing a cooling upgrade you don't need.",
        },
        {
          id: "unsure",
          focus: "unsure",
          tag: "EXPLORE",
          label: "I'm not sure — help me compare",
          hint: "Compare all three GADDA builds plainly.",
          stageCaption:
            "Compare Regular, Pro and Ultimate plainly by sleeping position, feel and buying priority.",
          score: {},
          why: "you are comparing overall comfort preferences",
          insight: "We'll shortlist purely by sleeping position, feel and buying priority.",
        },
      ],
    },
  },

  tired: {
    key: "tired",
    kicker: "GADDA / THREE MATTRESSES. NO NONSENSE.",
    headline: "Eight hours. Still exhausted?",
    intro:
      "A mattress is only one piece of a good night. Let's check whether your bed is interrupting comfort — without pretending a mattress cures fatigue.",
    accentBg: "#f5efe5",
    stageEyebrow: "GADDA / MORNING REST STUDY",
    stageBadge: "01 · WAKING UP TIRED",
    infographic: "/sleepmatch/infographics/tired.jpg",
    infographicAlt:
      "Editorial illustration of a tired person sitting on the edge of their bed in warm morning light beside a minimalist bedside clock",
    stageDefaultCaption:
      "Time in bed doesn't automatically tell us whether the mattress is interrupting your rest.",
    stageFooterRight: "Not a medical diagnosis",
    positionTitle: "When you do get comfortable, how do you usually lie?",
    q1: {
      kind: "concern",
      eyebrow: "01 / YOUR MORNINGS",
      title: "What happens before you wake up tired?",
      subtitle: "Be honest — if you sleep through fine, a new mattress may not be the answer.",
      whyItMatters:
        "Separating physical bed discomfort from general tiredness keeps us from selling you a mattress you don't need.",
      choices: [
        {
          id: "uncomfortable",
          focus: "uncomfortable",
          tag: "DISCOMFORT",
          label: "I wake up because the bed feels uncomfortable",
          hint: "The surface feels too hard, too soft, or uneven at night.",
          stageCaption:
            "Physical surface discomfort is something a better-matched feel and support base can address.",
          score: { pro: 2 },
          why: "bed surface discomfort interrupts your night",
          insight:
            "Next we'll check your sleeping position and preferred firmness to find a steadier or more cushioned fit.",
        },
        {
          id: "warm-wake",
          focus: "warm",
          tag: "WARMTH",
          label: "I wake up feeling too warm",
          hint: "Heat makes it harder to stay settled through the night.",
          stageCaption:
            "Breathable covers and cooling-oriented comfort foam help alongside lighter bedding and room airflow.",
          score: { ultimate: 3 },
          why: "temperature comfort matters to your sleep",
          insight:
            "We'll factor in breathable comfort layers while remembering that room airflow and covers still play a major role.",
        },
        {
          id: "stiff-wake",
          focus: "stiff",
          tag: "STIFFNESS",
          label: "I wake up feeling stiff",
          hint: "I want to compare cushioning and underlying support.",
          stageCaption:
            "We'll compare cushioning and underlying support preferences — without making clinical claims.",
          score: { pro: 2 },
          why: "you want to compare support and surface cushioning",
          insight:
            "This finder matches comfort preferences — it does not diagnose or treat fatigue or pain.",
        },
        {
          id: "sleep-through",
          focus: "through",
          tag: "NON-MATTRESS",
          label: "I sleep through, but still wake up exhausted",
          hint: "The mattress itself might not be the real reason.",
          stageCaption:
            "Sleeping through without bed discomfort points beyond the mattress — consider routine or medical advice first.",
          score: {},
          why: "fatigue alone does not point to a mattress problem",
          insight:
            "Persistent exhaustion despite full nights of sleep can stem from schedule, stress, or health factors — consider speaking with a doctor.",
          nonMattressNote: {
            heading: "A new mattress may not solve persistent tiredness",
            body: "If you sleep through the night without bed discomfort yet still wake exhausted, a mattress change alone is unlikely to resolve fatigue. Consider reviewing sleep habits or consulting a healthcare professional. If you still want a comfort shortlist, here is your closest GADDA build:",
          },
        },
      ],
    },
  },

  restless: {
    key: "restless",
    kicker: "GADDA / THREE MATTRESSES. NO NONSENSE.",
    headline: "47 positions. Still uncomfortable?",
    intro:
      "Side. Back. Side again. Let's figure out whether your surface has too little cushioning, too much sink, or simply the wrong feel.",
    accentBg: "#f5efe5",
    stageEyebrow: "GADDA / SLEEPING POSITIONS STUDY",
    stageBadge: "01 · RESTLESS NIGHTS",
    infographic: "/sleepmatch/infographics/restless.jpg",
    infographicAlt:
      "Editorial illustration showing three natural sleeping positions side by side: side sleeping, back sleeping and stomach sleeping",
    stageDefaultCaption:
      "Turning from hard pressure points and turning from feeling stuck point to very different mattress builds.",
    stageFooterRight: "Side · Back · Stomach",
    positionTitle: "Which position feels best when you finally settle?",
    q1: {
      kind: "concern",
      eyebrow: "01 / WHY YOU KEEP TURNING",
      title: "What makes you change position at night?",
      subtitle: "Pick the sensation that actually makes you shift.",
      whyItMatters:
        "Turning from hard pressure points and turning from feeling stuck point to very different mattress builds.",
      choices: [
        {
          id: "pressure",
          focus: "pressure",
          tag: "TOO HARD",
          label: "Pressure around my shoulders or hips",
          hint: "The surface feels unyielding where my joints rest.",
          stageCaption:
            "A softer comfort layer over a steady support core eases contact feel at the shoulders and hips.",
          score: { pro: 6, ultimate: 3 },
          why: "you want more cushioning around shoulders and hips",
          insight:
            "A softer comfort layer over a steady support base cushions contact points without feeling saggy.",
        },
        {
          id: "stuck",
          focus: "stuck",
          tag: "TOO MUCH SINK",
          label: "I sink in and feel stuck",
          hint: "Turning over takes effort; I want a steadier surface.",
          stageCaption:
            "A firmer, more buoyant foam top keeps you resting on the surface so turning feels effortless.",
          score: { regular: 6, pro: 2 },
          why: "you prefer less sink-in and easier movement",
          insight:
            "A firmer, more buoyant foam surface lets you lie on top and change positions effortlessly.",
        },
        {
          id: "warm",
          focus: "warm",
          tag: "TOO WARM",
          label: "The surface gets too warm",
          hint: "I keep moving to find a cooler spot on the bed.",
          stageCaption:
            "Breathable covers and cooling-oriented comfort foam help alongside lighter cotton bedding.",
          score: { ultimate: 4 },
          why: "surface temperature comfort matters to you",
          insight:
            "Compare breathable covers and cooling-oriented comfort layers alongside lighter cotton bedding.",
        },
        {
          id: "unsure",
          focus: "unsure",
          tag: "COMPARE",
          label: "Nothing specific feels quite right",
          hint: "Help me compare firm, balanced and plush feels.",
          stageCaption:
            "We'll narrow down Regular, Pro and Ultimate using your sleeping position, feel and priority.",
          score: {},
          why: "you want to compare surface firmness and contouring",
          insight: "We'll narrow down the three builds using your position, feel and priority.",
        },
      ],
    },
  },

  stiff: {
    key: "stiff",
    kicker: "GADDA / THREE MATTRESSES. NO NONSENSE.",
    headline: "Your morning shouldn't start with a backache.",
    intro:
      "Firmness and support are not the same thing. Let's compare cushioning and support preferences — without making medical promises.",
    accentBg: "#f5efe5",
    stageEyebrow: "GADDA / CUSHIONING & SUPPORT",
    stageBadge: "01 · MORNING STIFFNESS",
    infographic: "/sleepmatch/infographics/stiff.jpg",
    infographicAlt:
      "Editorial illustration of a natural side-sleeping figure on a conceptual mattress cross-section showing cushioning around the shoulders and hips above a steady support base",
    stageDefaultCaption:
      "Conceptual illustration: top layers cushion shoulders and hips while the denser base underneath provides steady hold.",
    stageFooterRight: "Conceptual · not clinical data",
    positionTitle: "Which sleeping position feels most comfortable for you?",
    q1: {
      kind: "concern",
      eyebrow: "01 / SURFACE VS SUPPORT",
      title: "What feels off about your current bed?",
      subtitle: "Focus on how the surface interacts with your body. Stiffness can have many causes.",
      whyItMatters:
        "A board-hard surface and an overly soft sagging bed create opposite comfort problems.",
      choices: [
        {
          id: "hard",
          focus: "hard",
          tag: "TOO FIRM",
          label: "The surface feels too hard",
          hint: "Shoulders, hips or lower back feel pushed against a rigid top.",
          stageCaption:
            "Comfort cushioning sits on top while the dense foam core underneath provides steady hold.",
          score: { pro: 5, ultimate: 2 },
          why: "you want more surface cushioning above steady support",
          insight:
            "Comfort cushioning sits on top; support comes from the dense foam core underneath. Persistent pain warrants medical advice.",
        },
        {
          id: "hips-sink",
          focus: "sink",
          tag: "TOO SOFT",
          label: "My hips seem to sink too far",
          hint: "The middle dips and lacks a steady, level hold.",
          stageCaption:
            "A steadier, higher-support surface reduces deep midsection dip for a more level feel.",
          score: { regular: 5, pro: 2 },
          why: "you prefer a steadier base with less hip sink",
          insight:
            "A higher-support, firmer surface keeps you resting more evenly on top of the mattress.",
        },
        {
          id: "balance",
          focus: "balance",
          tag: "BALANCE",
          label: "I want a balance of cushioning and hold",
          hint: "Gentle give on top, responsive support underneath.",
          stageCaption:
            "Balanced memory foam over high-resilience support combines gentle top give with steady hold.",
          score: { pro: 4 },
          why: "you want balanced cushioning and responsive support",
          insight:
            "Medium-balanced memory foam over high-resilience support is the sweet spot for many combination and side sleepers.",
        },
        {
          id: "unsure",
          focus: "unsure",
          tag: "UNDECIDED",
          label: "I can't tell if it's the mattress",
          hint: "Explore comfort preferences without assuming the cause.",
          stageCaption:
            "Morning stiffness has many causes beyond the bed. Persistent or severe pain warrants medical advice.",
          score: {},
          why: "you are exploring comfort preferences cautiously",
          insight:
            "Morning stiffness has many non-mattress causes. Persistent or severe pain should be evaluated by a healthcare professional.",
          nonMattressNote: {
            heading: "Not sure it's your bed? Check before buying",
            body: "Morning stiffness can come from posture, activity, pillows, or medical factors — not only your mattress. If pain is persistent or severe, consult a healthcare professional. If you still want to compare GADDA constructions by comfort feel, here is your closest match:",
          },
        },
      ],
    },
  },
};

export function stepsForCampaign(key: CampaignKey): QuizStep[] {
  const cfg = CAMPAIGNS[key];
  return [
    cfg.q1,
    {
      kind: "position",
      eyebrow: "02 / HOW YOU SLEEP",
      title: cfg.positionTitle,
      subtitle: "Think about how you actually fall asleep, not how you think you should.",
      whyItMatters:
        "Sleeping position changes which parts of your body carry the most weight against the surface.",
      choices: SHARED_POSITION_CHOICES,
    },
    SHARED_FEEL_STEP,
    SHARED_PRIORITY_STEP,
  ];
}
