// Turn the single-file build into page content (title, styles and scripts, no html/head/body wrapper).
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist-artifact/index.html', 'utf8');
const pick = (re) => [...html.matchAll(re)].map((m) => m[0]).join('\n');
const out = [
  pick(/<title>[\s\S]*?<\/title>/g),
  pick(/<link[^>]+fonts\.(googleapis|gstatic)[^>]*>/g),
  pick(/<style[\s\S]*?<\/style>/g),
  '<div id="root"></div>',
  pick(/<script[\s\S]*?<\/script>/g),
].join('\n');
writeFileSync('dist-artifact/classic-canasta-arena.html', out);
console.log(`wrote dist-artifact/classic-canasta-arena.html (${(out.length / 1024).toFixed(0)} KB)`);
