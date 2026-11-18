#!/usr/bin/env node
/* Run after `npm run dev`: node scripts/verify-seo.mjs http://localhost:3000 */
const origin = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const pages = ['/', '/mattresses', '/mattresses/guwahati', '/mattresses/gadda-regular', '/mattresses/gadda-pro', '/mattresses/gadda-ultimate'];
let errors = 0;
const check = (ok, label) => { console.log(`${ok ? 'PASS' : 'FAIL'}: ${label}`); if (!ok) errors++; };
const xmlPaths = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt'];
for (const path of xmlPaths) {
  const res = await fetch(origin + path);
  const body = await res.text();
  check(res.ok && body.length > 100, `${path} available (${res.status})`);
  if (path === '/robots.txt') check(body.includes('OAI-SearchBot') && body.includes('sitemap.xml') && body.includes('PerplexityBot'), 'crawler rules and sitemap');
  if (path === '/sitemap.xml') check(body.includes('/mattresses/guwahati') && body.includes('/mattresses/gadda-ultimate'), 'Guwahati and product URLs in sitemap');
  if (path.startsWith('/llms')) check(body.includes('GADDA') && !body.includes('RAZORPAY_KEY_SECRET'), 'public brand facts only');
}
for (const path of pages) {
  const res = await fetch(origin + path);
  const html = await res.text();
  check(res.ok, `${path}: HTTP ${res.status}`);
  const h1 = [...html.matchAll(/<h1(?:\s|>)/gi)].length;
  check(h1 === 1, `${path}: one server-rendered H1 (found ${h1})`);
  check(/<link[^>]+rel="canonical"/i.test(html), `${path}: canonical link`);
  check(/<meta[^>]+name="description"/i.test(html), `${path}: description`);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
  check(Boolean(title) && title.length < 65, `${path}: title present, under 65 characters (${title.length})`);
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  check(scripts.length > 0, `${path}: JSON-LD present`);
  let schemas = [];
  for (const m of scripts) {
    try { const parsed = JSON.parse(m[1]); schemas.push(...(Array.isArray(parsed) ? parsed : [parsed])); }
    catch (err) { check(false, `${path}: invalid JSON-LD ${err.message}`); }
  }
  const org = schemas.find((o) => o['@type'] === 'Organization');
  check(Boolean(org?.name && org?.url), `${path}: Organization has name and url`);
  if (path.includes('gadda-')) {
    const product = schemas.find((o) => o['@type'] === 'Product');
    check(Boolean(product?.name && product?.brand && product?.offers && product?.additionalProperty?.length), `${path}: Product fields`);
    check(Number.isFinite(Number(product?.offers?.lowPrice || product?.offers?.price)), `${path}: numerical price`);
  }
  for (const s of schemas.filter((o) => o['@type'] === 'LocalBusiness')) {
    check(Boolean(s.address?.streetAddress && s.address?.addressLocality && s.address?.postalCode), `${path}: LocalBusiness verified address`);
  }
}
console.log(errors ? `\n${errors} SEO validation failure(s)` : '\nSEO checks passed. Run Google Rich Results Test and Search Console separately.');
process.exitCode = errors ? 1 : 0;
