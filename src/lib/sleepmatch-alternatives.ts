/** Independent buyer checklists, not allegations of misconduct or unverified tests.
 * We describe search intent and GADDA's documented construction, not competitors' unverified performance. */
export type AlternativeGuide = {
  slug: string; brand: string; title: string; description: string; focus: string;
  intro: string; questions: { heading: string; answer: string }[];
  checklist: string[];
  gaddaAngle: string; recommendedSlug: string; problemParam: string;
  reviewLabel: string; reviewUrl: string; faq: {q: string; a: string}[];
};

export const ALTERNATIVES: AlternativeGuide[] = [
  {
    slug: "wakefit-mattress", brand: "Wakefit",
    title: "Considering a Wakefit mattress alternative? Check delivery, support and comfort first",
    description: "Researching Wakefit mattress reviews, delivery delays or alternatives? Use a practical mattress buying checklist, then compare GADDA's three foam constructions.",
    focus: "Delivery expectations and the cost of buying the wrong feel",
    intro: "If a delivery experience or after-sales review has made you cautious about buying a mattress online, the useful question is not whether every brand is good or bad. It's whether you can verify the exact size, delivery area, realistic timeframe, refund eligibility and support contact before paying. An individual review is evidence of one experience, not a verdict on every order.",
    questions: [
      { heading: "What is the written delivery commitment to my PIN?", answer: "Check whether your exact postal code is serviceable, whether dispatch and transit windows are estimates, and what happens if a promised delivery is missed. Confirm which person or support channel can give you an order update." },
      { heading: "What if my preferred mattress feels wrong?", answer: "Find the applicable trial policy before paying. Check whether returns cover comfort preference, whether a minimum usage period applies, how a pickup is arranged, and whether conditions differ for custom dimensions." },
      { heading: "How do I compare support instead of advertising claims?", answer: "Look for the actual comfort layers, the support-core material, the firmness description, dimensions and whether an upgrade changes the construction. No mattress can guarantee comfort for every body." },
    ],
    checklist: [
      "Compare the delivered price for the same dimensions and thickness—not only a hero starting price.",
      "Confirm the delivery PIN and a realistic service window before checkout.",
      "Save the current trial exclusions, pickup conditions and refund procedure.",
      "Keep the order receipt and a written record of service commitments.",
    ],
    gaddaAngle: "GADDA shows Regular, Pro and Ultimate with layer descriptions and size-based pricing. Its checkout checks eligible Assam and Meghalaya PIN codes; it is not a promise of next-day delivery. If you want a balanced feel, compare Pro's memory-foam comfort and HR support against Regular's firmer, simpler construction.",
    recommendedSlug: "gadda-pro", problemParam: "firm",
    reviewLabel: "Independent buyer discussion on MouthShut", reviewUrl: "https://www.mouthshut.com/review/wake-fit-mattresses-review-nnqrunosrop",
    faq: [
      {q: "Are all Wakefit deliveries delayed?", a: "No such conclusion can be drawn from individual customer complaints. Check current delivery commitments for your own order and postal code."},
      {q: "Does GADDA deliver nationwide?", a: "No. GADDA currently screens delivery to Assam and Meghalaya PIN codes only, subject to final eligibility checks."},
      {q: "Which GADDA mattress feels balanced?", a: "GADDA Pro is positioned as a balanced-feel mattress with memory foam over an HR support base. Comfort is personal; use SleepMatch to compare all three."},
    ],
  },
  {
    slug: "sleepycat-mattress", brand: "SleepyCat",
    title: "Looking for a SleepyCat alternative? Start with firmness and mattress fit",
    description: "Unhappy with a soft, hard or uncomfortable mattress? Evaluate firmness, foam layers and trial conditions before comparing GADDA with SleepyCat.",
    focus: "Firmness mismatch and support preferences",
    intro: "Reviews describing a mattress as too soft, too firm or unsupportive are reminders that comfort is individual. A firmness rating alone cannot tell you how a particular sleeper will feel. It helps to separate the surface's cushioning from the support below it—and to read the trial rules before ordering.",
    questions: [
      { heading: "Is my issue firmness, pressure or visible sagging?", answer: "A firm surface can still feel uncomfortable at shoulders or hips. A plush surface may feel comfortable initially yet have more give than you prefer. Visible permanent sagging may be a different, warranty-related question. Identify which describes your experience." },
      { heading: "What materials are actually doing the work?", answer: "Look beyond 'orthopaedic' or 'premium' labels. Examine the upper comfort layer, the transition layer, and the foam density or spring construction of the support core, where disclosed." },
      { heading: "Will a 100-night trial automatically accept my return?", answer: "Do not assume that. Read eligibility, mattress condition, permitted reasons, custom-size exclusions, pickup procedures and refund timelines as written by the seller." },
    ],
    checklist: [
      "Describe your problem before selecting a firmness label.",
      "Compare the layer construction and dimensions of the exact model.",
      "Read the current trial policy, not a social advertisement's short headline.",
      "Measure your bed frame before selecting any size option.",
    ],
    gaddaAngle: "If your main complaint is sinking too far, consider the firmer feel of GADDA Regular. If the issue is a hard surface around your shoulders and hips, GADDA Pro has memory foam above an HR base. Ultimate offers a more plush feel and additional comfort layers. These are starting points, not medical prescriptions.",
    recommendedSlug: "gadda-regular", problemParam: "sinking",
    reviewLabel: "SleepyCat buyer reviews on MouthShut", reviewUrl: "https://www.mouthshut.com/product-reviews/sleepycat-mattress-reviews-926025189",
    faq: [
      {q: "Is softer always better for back comfort?", a: "No. Firmness and support are distinct, and individual preferences and medical conditions vary. A mattress finder cannot diagnose back pain."},
      {q: "Is GADDA Regular an orthopaedic treatment?", a: "No. It is a firmer-feel mattress with a soft comfort layer and HD foam base, not a medical treatment."},
      {q: "Can I skip the GADDA quiz?", a: "Yes. You can visit any product page directly and compare dimensions, materials and prices."},
    ],
  },
  {
    slug: "the-sleep-company-mattress", brand: "The Sleep Company",
    title: "Comparing The Sleep Company alternatives? Understand comfort technology first",
    description: "Researching The Sleep Company alternatives or trial experiences? Compare comfort claims with real layer specifications, price and support choices at GADDA.",
    focus: "Technology marketing versus testable buying criteria",
    intro: "A distinctive mattress technology can be a useful product differentiator, but a trademark or proprietary name is not enough to establish which mattress will suit you. Before switching brands, compare actual constructions, price for your bed size, delivery serviceability and the written terms for returns. A customer review reflects that person's experience; it does not prove a universal defect.",
    questions: [
      { heading: "Can I describe what the comfort technology actually does?", answer: "Ask what the contact surface is made from, how it responds to body weight, how the support core works, and whether the specific model publishes relevant materials or testing details. Treat general technology labels as a starting point, not a guarantee." },
      { heading: "What changes when I select a different size or upgrade?", answer: "Compare final price at the same length, width and thickness. Check whether optional layers, latex or spring upgrades change the feel or the total delivered price." },
      { heading: "Does a trial protect me if the feel is wrong?", answer: "Look at the official terms for eligible products, use conditions, exclusions, pickup, refunds and timing. Verify how these terms apply to your chosen model and size." },
    ],
    checklist: [
      "Match materials and layer order to your comfort needs, not just branded technology names.",
      "Compare full product specifications for the exact model and size.",
      "Verify your delivery PIN and any dispatch expectations.",
      "Read and preserve the specific trial and refund terms you are agreeing to.",
    ],
    gaddaAngle: "GADDA does not claim to reproduce another brand's proprietary technology. Regular uses soft foam and an HD foam base; Pro has memory foam over transition foam and 32D HR support, with an optional pocket-spring base; Ultimate has cooling-oriented memory foam, adaptive foam and a 40D HR core, with an optional latex top. Choose by feel and construction, not by an imitation claim.",
    recommendedSlug: "gadda-ultimate", problemParam: "hot",
    reviewLabel: "The Sleep Company buyer reviews on Trustpilot", reviewUrl: "https://www.trustpilot.com/review/thesleepcompany.in",
    faq: [
      {q: "Does GADDA use The Sleep Company's SmartGRID technology?", a: "No. GADDA describes its own foam, spring and latex options. We do not imply equivalence to another brand's proprietary material."},
      {q: "Does cooling memory foam guarantee a cooler body temperature?", a: "No. Room temperature, bedding and individual preferences also affect warmth; GADDA makes no universal temperature guarantee."},
      {q: "Where can I see GADDA's real materials?", a: "The SleepMatch product story and individual GADDA product pages show the currently published layer construction."},
    ],
  },
];

export const alternativeBySlug = (slug: string) => ALTERNATIVES.find((x) => x.slug === slug);
