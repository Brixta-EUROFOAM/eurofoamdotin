/*
  A different main photo for an upgrade, on the product page: pick the
  upgrade in the buy box and the gallery jumps to its photo; switch back and
  the normal photo returns. Matched by a word in the choice's label, so it
  keeps working if the label is edited in Admin (e.g. "Latex" or "Natural latex").
*/
export const OPTION_PHOTOS: Record<string, Record<string, string>> = {
  "gadda-ultimate": { latex: "/products/gadda-ultimate/layers-latex.webp" },
  "gadda-pro": { spring: "/products/gadda-pro/v4-layers-springs.webp" },
};

export function optionPhoto(slug: string, picked: Record<string, string | undefined>): string | null {
  const map = OPTION_PHOTOS[slug];
  if (!map) return null;
  for (const label of Object.values(picked)) {
    const l = (label || "").toLowerCase();
    for (const [word, src] of Object.entries(map)) if (l.includes(word)) return src;
  }
  return null;
}

/* the buy box tells the gallery what's picked */
export const OPTIONS_EVENT = "gadda:options";
export type OptionsDetail = { slug: string; picked: Record<string, string | undefined> };
