# efail-site

The landing page for [Efail](https://github.com/typenx/efail), the deterministic
game engine built for AI agents. A static site with no dependencies, made to
be read equally well by people, search engines and AI agents.

## Run it

```sh
npm start                           # builds src/ -> dist/, then serves it on PORT (3000)
```

There are no dependencies to install. `npm run build` builds without serving.

## Deploy on Railway

Connect the repo and generate a public domain for the service (Settings >
Networking). `railway.json` sets the start command (`npm start`) and a
health check; Railway supplies `PORT`.

Canonical URLs, the sitemap, `robots.txt` and `llms.txt` carry the site's
public address. It is the `CANONICAL` constant at the top of `build.mjs`
(the Railway domain), so every copy of the site, on any host, points to the
same one. To change it, edit the constant or set a `SITE_URL` variable (for
example `https://efail.dev` once there is a custom domain).

Any other host that runs Node works the same way: run `npm start` with
`PORT` set.

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
src/<32 hex>.txt    the IndexNow key, which proves the site is ours when we tell
                    Bing and others that pages changed (see below)
build.mjs           fills in the site URL; writes llms-full.txt and sitemap.xml
server.mjs          serves dist/: headers, gzip, and Markdown for
                    `Accept: text/markdown` on /
railway.json        the start command and health check for Railway
tools/              how the images were made
docs/future-notes.md  what is left to do later (not published)
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

## Telling search engines about changes

[IndexNow](https://www.indexnow.org) notifies Bing, Yandex, Seznam and Naver
that pages changed. After a deploy that changes content:

```sh
KEY=$(basename src/????????????????????????????????.txt .txt)
HOST=efail-site-production.up.railway.app
curl -s -o /dev/null -w '%{http_code}\n' https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d "{\"host\":\"$HOST\",\"key\":\"$KEY\",\"urlList\":[\"https://$HOST/\",\"https://$HOST/docs/2d.md\",\"https://$HOST/docs/3d.md\"]}"
```

200 or 202 means it was accepted. Google does not use IndexNow: add the site
in Google Search Console and submit `/sitemap.xml` there.
