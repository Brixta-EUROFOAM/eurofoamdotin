/* Phone/WhatsApp helpers that ignore the "+91 00000 00000" placeholder. */

export function realDigits(phone?: string) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 10 || /^(91)?0+$/.test(digits)) return null;
  return digits.length === 10 ? `91${digits}` : digits;
}

export function phoneLink(phone?: string) {
  const d = realDigits(phone);
  return d ? { href: `tel:+${d}`, label: phone!.trim() } : null;
}

export function whatsappLink(phone?: string, text = "Hi GADDA! I have a question about the mattresses.") {
  const d = realDigits(phone);
  return d ? `https://wa.me/${d}?text=${encodeURIComponent(text)}` : null;
}

export function realEmail(email?: string) {
  return email && !email.endsWith(".example") && email.includes("@") ? email : null;
}
