# efail-site

The landing page for [Efail](https://github.com/typenx/efail), the deterministic
game engine built for AI agents. A static site with no dependencies, made to
be read equally well by people, search engines and AI agents.

## Build and preview

```sh
node build.mjs                      # src/ -> dist/
npx serve dist                      # or: cd dist && python3 -m http.server
```

## Deploy on Vercel

Import the repo. `vercel.json` already sets the build command
(`node build.mjs`) and the output directory (`dist`); there is nothing to
configure.

Canonical URLs, the sitemap, `robots.txt` and `llms.txt` need the site's
public address. The build takes it from, in order:

1. `SITE_URL` (set it in Vercel's environment variables once you have a
   custom domain, for example `https://efail.dev`),
2. `VERCEL_PROJECT_PRODUCTION_URL` (Vercel sets this itself),
3. `http://localhost:3000`.

## What is here

```
src/index.html      the page: all content is in the HTML, no JavaScript needed
src/index.md        the same page as Markdown, for agents
src/llms.txt        a short index for agents (llmstxt.org format)
src/docs/2d.md      a copy of the engine's AGENTS.md
src/docs/3d.md      a copy of the engine's AGENTS3D.md
src/play/dodge.html the Dodge example, built with `efail web`
src/img/            screenshots made by `efail shot` and `efail film`
src/robots.txt      allows search and AI crawlers, points to the sitemap
build.mjs           fills in the site URL; writes llms-full.txt and sitemap.xml
vercel.json         headers, and Markdown for `Accept: text/markdown` on /
tools/              how the images were made
```

## How it serves search engines

- One `<h1>`, semantic sections, descriptive `alt` text, image sizes set.
- Title, description, canonical URL, Open Graph and Twitter cards.
- JSON-LD: `WebSite`, `SoftwareApplication` and `FAQPage`. The FAQ text in
  the JSON-LD matches the visible FAQ word for word; keep them in step.
- `sitemap.xml` and `robots.txt`.
- No framework, no web fonts, no render-blocking requests: about 30 KB of HTML
  and a few KB of images.

## How it serves AI agents

- Everything is in the first HTML response; crawlers that don't run
  JavaScript miss nothing.
- `/llms.txt` indexes the site, `/llms-full.txt` holds the landing page and
  both guides in one file, and `/index.md` is the page as Markdown.
- `GET /` with `Accept: text/markdown` returns the Markdown (with
  `Vary: Accept`). The HTML advertises it with `<link rel="alternate"
  type="text/markdown">` and a `Link` header.
- The docs are served as raw Markdown, with CORS open.
- The page opens with a one-sentence definition of Efail and answers
  questions in plain, quotable sentences.
- `robots.txt` names the AI crawlers and allows them.

Check it after a deploy:

```sh
curl -sI https://YOUR-SITE/ | grep -i -E 'link|vary'
curl -s -H 'Accept: text/markdown' https://YOUR-SITE/ | head
```

## Updating from the engine

From a checkout of the engine:

```sh
cp AGENTS.md   ../efail-site/src/docs/2d.md
cp AGENTS3D.md ../efail-site/src/docs/3d.md
(cd examples/dodge && efail web && cp build/game.html ../../../efail-site/src/play/dodge.html)
```

Screenshots come from `efail shot` and `efail film` in `examples/`. The engine
writes uncompressed PNGs, so shrink each with
`node tools/repng.mjs in.png out.png`. The share image `src/img/og.png` is
`tools/og-card/game.bend` run with `efail shot --ticks 1`.
