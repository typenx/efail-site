// Builds src/ into dist/. No dependencies.
//   - replaces __SITE_URL__ with the site's public origin
//   - writes llms-full.txt (landing page + both guides in one file)
//   - writes sitemap.xml
//
// The origin comes from SITE_URL, or from Vercel's production domain, so a
// custom domain needs no code change:  SITE_URL=https://example.com node build.mjs
import fs from 'node:fs';
import path from 'node:path';

const env = process.env;
const site = (
  env.SITE_URL ||
  (env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:3000'
).replace(/\/+$/, '');

const src = 'src', out = 'dist';
const TEXT = new Set(['.html', '.md', '.txt', '.xml', '.svg', '.json']);
// The playable demo is engine output: copy it byte for byte.
const verbatim = (rel) => rel.startsWith(`play${path.sep}`);

fs.rmSync(out, { recursive: true, force: true });

for (const rel of fs.readdirSync(src, { recursive: true })) {
  const from = path.join(src, rel), to = path.join(out, rel);
  if (fs.statSync(from).isDirectory()) continue;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (TEXT.has(path.extname(rel)) && !verbatim(rel)) {
    fs.writeFileSync(to, fs.readFileSync(from, 'utf8').replaceAll('__SITE_URL__', site));
  } else {
    fs.copyFileSync(from, to);
  }
}

const read = (rel) => fs.readFileSync(path.join(out, rel), 'utf8').trim();
fs.writeFileSync(path.join(out, 'llms-full.txt'), [
  read('index.md'),
  `---\n\n<!-- Source: ${site}/docs/2d.md -->\n\n${read('docs/2d.md')}`,
  `---\n\n<!-- Source: ${site}/docs/3d.md -->\n\n${read('docs/3d.md')}`,
].join('\n\n') + '\n');

const today = new Date().toISOString().slice(0, 10);
const pages = ['/', '/index.md', '/docs/2d.md', '/docs/3d.md', '/llms.txt', '/llms-full.txt'];
fs.writeFileSync(path.join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.map((p) => `  <url><loc>${site}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`);

console.log(`built ${out}/ for ${site}`);
