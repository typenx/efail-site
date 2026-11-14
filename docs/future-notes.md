# Future notes

Things left to do later for the Efail site. This file is not published: only
`src/` goes on the site.

Live site (canonical): https://efail-site-production.up.railway.app

## 1. Google Search Console

Google does not use IndexNow, so it has to be told about the site by hand.

1. Go to https://search.google.com/search-console and add a "URL prefix"
   property for the live site address.
2. Choose the "HTML tag" verification method. It gives a tag like
   `<meta name="google-site-verification" content="...">`.
3. Add that tag inside `<head>` in `src/index.html`, push, and wait for the
   deploy. Then click Verify. Verification is near instant.
4. Under Sitemaps, submit `sitemap.xml`.

What to expect: first indexing takes a few days to two weeks, the reports
lag two or three days, and ranking for competitive phrases takes weeks to
months.

Bing Webmaster Tools (https://www.bing.com/webmasters) is optional: it can
import the site from Search Console, and Bing already gets our IndexNow
pings.

## 2. Check whether the site is indexed

Search each engine for:

```
site:efail-site-production.up.railway.app
```

Then try the phrases the page targets and see where it lands:

- game engine for AI agents
- agent-native game engine
- deterministic game engine
- headless game engine
- game engine for Claude Code / Codex
- how does an AI agent make a game

Once pages are indexed, rerun the blind test: ask a fresh AI agent, with no
context, "Can you find a game engine built for AI agents?" and see whether
Efail comes back. On the first try (the day the site launched) it did not;
it found Arcane, BGE, llmgine, nAIVE Engine and Summer Engine instead.

## 3. A custom domain

A `railway.app` subdomain carries little weight in search, and anything it
earns is lost if the site moves. When there is a domain:

1. Add it to the service in Railway (Settings > Networking).
2. Change the `CANONICAL` constant at the top of `build.mjs` (or set a
   `SITE_URL` variable in Railway).
3. Update the `HOST` in the IndexNow command in `README.md`, then run it.
4. Add the new address as a property in Search Console and submit the
   sitemap again.
5. Update the homepage link on the GitHub repo.

## 4. When the engine repo is public again

The engine repository is private for now while more is built.

Before making it public:

- Read through it for anything private: notes about personal machines and
  how to reach them, and the email addresses on commits. These are in the
  git history too, so removing them from the current files is not enough.

After it is public:

- Remove the "temporarily private" notes from `src/index.html` (quick
  start), `src/index.md` and `src/llms.txt`.
- Check that the GitHub links and the `git clone` step on the page work.
- Refresh the copied docs, demo and screenshots (see "Updating from the
  engine" in `README.md`).
- Add topics and a homepage link to the engine repo. GitHub repos rank
  quickly for this kind of search.

## 5. Inbound links (only when wanted)

The plan for now is to grow slowly and organically, with no posts. If that
changes, the options are a Show HN post and entries in "awesome" lists for
AI-agent tooling and game engines. Both need the engine to be public first.

## 6. The Vercel copy

https://efail-site.vercel.app is still online. It names the Railway address
as canonical, so it does not compete in search, but it can be deleted in
Vercel if it is not needed.

## 7. Content ideas

- Separate pages for the phrases above (for example `/deterministic-game-engine`),
  each with its own title, description and Markdown twin. One page can only
  rank for so many phrases.
- HTML versions of the 2D and 3D guides. They are served as Markdown only,
  which agents prefer, but search engines index HTML better.
- A short page per example game, with its film strip and a playable build.
- A changelog page: search engines favor sites that change.

## 8. Housekeeping

- After any content change, run the IndexNow command in `README.md`.
- The FAQ exists twice in `src/index.html`: visible, and in the JSON-LD
  block. Keep the two word for word the same.
- Chromium was installed on the server (rhydian) with `snap install
  chromium` to test the page at phone sizes. Remove it with `snap remove
  chromium` if it is not wanted.
