#!/usr/bin/env node
/* Inventory source images that need human-reviewed alt text or format upgrades. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const crawl = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
  d.isDirectory() ? crawl(join(dir, d.name)) : /\.tsx$/.test(d.name) ? [join(dir, d.name)] : []);
let issues = 0, images = 0;
for (const file of crawl('src')) {
  const src = readFileSync(file, 'utf8');
  for (const tag of src.matchAll(/<img\b[\s\S]*?>/g)) {
    images++;
    const raw = tag[0];
    if (!/\balt\s*=/.test(raw)) { console.log(`${file}: missing alt attribute`); issues++; }
    if (!/\bloading\s*=/.test(raw)) { console.log(`${file}: review eager vs lazy loading`); issues++; }
    if (/\.(png|jpe?g)(?:[?'"\s]|$)/i.test(raw)) { console.log(`${file}: consider WebP/AVIF when visual quality and source permit`); }
  }
}
console.log(`Audited ${images} static <img> tags: ${issues} potential accessibility/performance fixes to review.`);
console.log('Decorative alt="" can be correct. Do not falsely describe image content.');
