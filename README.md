# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Directus Notes

Set the following environment variables for local development:

```bash
NUXT_PUBLIC_DIRECTUS_URL=https://your-directus-instance.example
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

If you don't want to allow public testimonial submissions from the Directus public role, add a server token:

```bash
NUXT_DIRECTUS_TOKEN=your-directus-static-token
```

The testimonial page expects a `testimonials` collection in Directus with these fields:

```text
name      string
subject   string
quote     text
status    string
```

Published testimonials are displayed on the site. New submissions are created as `draft` so they stay subject to approval.
