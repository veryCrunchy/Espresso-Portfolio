# Espresso's Work

Portfolio and blog for [espressos.work](https://espressos.work), built with Nuxt 4, UnoCSS and a [Directus](https://cms.espressos.work) CMS. Everything visible on the site — pages, blog posts, links, navigation, colors and SEO defaults — is edited in the CMS.

## Setup

Requires Node 22.22+ (or 24) and pnpm 10.

```bash
pnpm install
cp .env.example .env   # then fill in the values
pnpm dev
```

| Variable | Purpose |
| --- | --- |
| `NUXT_PUBLIC_DIRECTUS_URL` | Directus base URL |
| `NUXT_DIRECTUS_TOKEN` | Server-side Directus token (reads + testimonial submissions) |
| `NUXT_PUBLIC_SITE_URL` | Public site URL for canonical links, sitemap and RSS (defaults to `https://espressos.work`) |
| `NUXT_PREMID_SECRET` | Shared secret required by `POST /api/premid` |
| `NUXT_PREVIEW_SECRET` | Secret in the CMS preview URLs that unlocks drafts and unsaved versions |

Other scripts: `pnpm build`, `pnpm preview`, `pnpm typecheck`.

## How it fits together

- `app/` — the Nuxt app (pages, components, composables).
- `server/` — API routes that talk to Directus. CMS responses are cached for 60 seconds (stale-while-revalidate); add `?preview=true` to any URL to bypass the cache. The Directus visual editor does this automatically.
- `shared/types/` — types for the CMS schema, used by both sides.
- `scripts/setup-directus.mjs` — creates the CMS collections and fields this site expects. It only adds what is missing and never deletes anything:

  ```bash
  NUXT_PUBLIC_DIRECTUS_URL=… NUXT_DIRECTUS_TOKEN=<admin token> node scripts/setup-directus.mjs --dry-run
  ```

## Editing content (CMS guide)

- **Pages** are built from blocks: Hero, Rich text, Gallery, **YouTube** (latest uploads from a channel), **Latest posts**, **Social links** and **Recent activity** (YouTube uploads and blog posts in one feed). Gallery blocks placed directly after each other become one gallery with tabs.
- **Design** — every page, post, the Links and Testimonials pages, and Site settings have a *Design* group: colors, text size, heading size, spacing, corner roundness, heading/body font and content width. Site settings are the defaults; anything left empty elsewhere inherits them.
- **Built-in routes** (`/blog`, `/links`) also read a CMS page with the same slug: its design applies to that route and its blocks are shown on it (e.g. the Recent activity feed on `/links`).
- **Posts** power `/blog`. Set the status to *Published* to make a post live; a future *Published at* date schedules it. Tags, excerpt, cover image and SEO fields are optional. Pinned (*featured*) posts sort first.
- **Blog page** holds the copy at the top of `/blog`.
- **Links** appear on `/links`, in the footer and in the Social links block. Brand icons are detected from the URL; set *Icon* (e.g. `simple-icons:bluesky`) to override.
- **Site settings** holds theme colors, the site name and description, the default link-preview image, the X/Twitter handle, the header menu and footer text.
- **Testimonials** submitted on the site arrive as drafts for approval.
- **Preview** — every collection has a preview URL. Drafts and unsaved content versions are only shown when the URL carries `NUXT_PREVIEW_SECRET`; `scripts/setup-directus.mjs` writes the preview URLs using that same value.

Uploaded images are served resized and in modern formats (AVIF/WebP) through Directus. Keep uploads in the `public` folder (the default for every image field) so visitors can see them.

## Feeds & SEO

`/rss.xml`, `/sitemap.xml` and `/robots.txt` are generated from the CMS. Every page gets a canonical URL, Open Graph and Twitter cards; blog posts also get article metadata and JSON-LD (`BlogPosting`, breadcrumbs).

## PreMID

`POST /api/premid` receives the PreMID activity webhook and shows it as a "now playing" pill in the header. Set `NUXT_PREMID_SECRET` and send it as `Authorization: Bearer <secret>` (or `?token=<secret>`).
