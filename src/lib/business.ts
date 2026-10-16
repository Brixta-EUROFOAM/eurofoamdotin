/*
  Legal + business identity. Everything the law asks an Indian online
  seller to show (Consumer Protection (E-Commerce) Rules 2020, Legal
  Metrology (Packaged Commodities) Rules, DPDP Act 2023) is read from here.

  ⚠ Fill in every empty string before launch. Empty values are hidden on
  the site rather than shown as placeholders, and `missingBusinessFields()`
  lists them on /admin so nothing is forgotten.
*/

export const BUSINESS_LEGAL_NAME = "UMADUTT INDUSTRIES";
export const BUSINESS_BRAND_NAME = "GADDA";
export const BUSINESS_ACTIVITY = "Sale of pillows and mattresses";
export const BUSINESS_DESCRIPTION =
  "GADDA is a business selling pillows and mattresses to customers through its website and other authorised sales channels.";
export const BUSINESS_PRODUCTS = ["Pillows", "Mattresses"] as const;

export const BUSINESS = {
  legalName: BUSINESS_LEGAL_NAME,
  brand: BUSINESS_BRAND_NAME,
  /* Registered office, one line per entry. */
  registeredAddress: [] as string[],
  /* Factory / manufacturer address printed on the label (Legal Metrology). */
  manufacturerAddress: [] as string[],
  gstin: "",
  /* CIN / Udyam / partnership registration, whichever applies. */
  registrationNo: "",
  countryOfOrigin: "India",
  supportHours: "Mon–Sat, 10 am – 7 pm",
  /* Grievance Officer — mandatory under E-Commerce Rules 2020, rule 4(4)
     and the DPDP Act s.8(10). Name, designation and a way to reach them. */
  grievanceOfficer: {
    name: "",
    designation: "Grievance Officer",
    email: "",
    phone: "",
  },
  /* Jurisdiction for the Terms of Sale. */
  jurisdictionCity: "Silchar, Assam",
  /* Policy numbers used across the site — change once, applies everywhere. */
  trialNights: 100,
  /* Years per product slug, e.g. { "gadda-pro": 7 }. Leave empty until the
     factory confirms — the site then says "Manufacturer warranty". */
  warrantyYears: {} as Record<string, number>,
  refundDays: 7,
  cancellationWindowHours: 24,
  policiesUpdated: "17 October 2026",
};

export function missingBusinessFields() {
  const missing: string[] = [];
  if (!BUSINESS.registeredAddress.length) missing.push("Registered address");
  if (!BUSINESS.manufacturerAddress.length) missing.push("Manufacturer address");
  if (!BUSINESS.gstin) missing.push("GSTIN");
  if (!BUSINESS.grievanceOfficer.name) missing.push("Grievance Officer name");
  if (!BUSINESS.grievanceOfficer.email) missing.push("Grievance Officer email");
  return missing;
}

export function warrantyLabel(slug: string) {
  const years = BUSINESS.warrantyYears[slug];
  return years ? `${years}-year warranty` : "Manufacturer warranty";
}

/* Standard Indian mattress sizes in inches (L × W). ⚠ Confirm against the
   factory's cutting sizes — shown in the size guide and on product pages. */
export const SIZE_GUIDE: { label: string; inches: string; cm: string; fits: string }[] = [
  { label: "Single", inches: "72 × 36 in", cm: "183 × 91 cm", fits: "One adult, kids' rooms, hostels" },
  { label: "Double", inches: "72 × 48 in", cm: "183 × 122 cm", fits: "One adult who likes space, or two children" },
  { label: "Queen", inches: "75 × 60 in", cm: "190 × 152 cm", fits: "Two adults — the most common Indian double bed" },
  { label: "King", inches: "78 × 72 in", cm: "198 × 183 cm", fits: "Two adults who want room, or a child who visits" },
];
