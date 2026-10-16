/* Structured data for search engines (Product, FAQ, Organization…). */
export default function JsonLd({ data, nonce }: { data: unknown; nonce?: string }) {
  // Escape "<" so a product name can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: json }} />;
}
