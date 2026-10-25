#!/usr/bin/env node
// Idempotent, additive Directus schema setup for the blog + integrations.
// It only creates what is missing (collections, fields, relations, permissions, seed rows)
// and never deletes anything.
//
// Usage: NUXT_PUBLIC_DIRECTUS_URL=… NUXT_DIRECTUS_TOKEN=<admin token> node scripts/setup-directus.mjs [--dry-run]

import { readFileSync } from 'node:fs';

const BASE = process.env.NUXT_PUBLIC_DIRECTUS_URL?.replace(/\/$/, '');
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || process.env.NUXT_DIRECTUS_TOKEN;
const DRY = process.argv.includes('--dry-run');

if (!BASE || !TOKEN) {
  console.error('Set NUXT_PUBLIC_DIRECTUS_URL and NUXT_DIRECTUS_TOKEN (admin) first.');
  process.exit(1);
}

async function api(method, path, body) {
  if (DRY && method !== 'GET') {
    console.log(`  [dry-run] ${method} ${path}`);
    return null;
  }
  const res = await fetch(BASE + path, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json?.errors ?? json)}`);
    err.status = res.status;
    throw err;
  }
  return json?.data ?? null;
}

const exists = (path) => api('GET', path).then(() => true, (e) => (e.status === 403 || e.status === 404 ? false : Promise.reject(e)));

// ---------------------------------------------------------------- field helpers

const UPLOAD_FOLDER_NAME = 'uploads';
let uploadFolder = null;

const uuidPk = () => ({
  field: 'id', type: 'uuid',
  meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] },
  schema: { is_primary_key: true, length: 36, has_auto_increment: false },
});
const intPk = () => ({
  field: 'id', type: 'integer',
  meta: { hidden: true, interface: 'input', readonly: true },
  schema: { is_primary_key: true, has_auto_increment: true },
});
const str = (field, meta = {}, schema = {}) => ({ field, type: 'string', meta: { interface: 'input', ...meta }, schema });
const text = (field, meta = {}) => ({ field, type: 'text', meta: { interface: 'input-multiline', ...meta }, schema: {} });
const html = (field, meta = {}) => ({
  field, type: 'text',
  meta: {
    interface: 'input-rich-text-html',
    options: {
      toolbar: ['undo', 'redo', 'bold', 'italic', 'underline', 'strikethrough', 'h2', 'h3', 'h4', 'numlist', 'bullist',
        'blockquote', 'customLink', 'customImage', 'customMedia', 'hr', 'code', 'removeformat', 'fullscreen'],
      folder: uploadFolder,
    },
    ...meta,
  },
  schema: {},
});
const int = (field, def, meta = {}) => ({ field, type: 'integer', meta: { interface: 'input', ...meta }, schema: { default_value: def } });
const bool = (field, def, meta = {}) => ({ field, type: 'boolean', meta: { interface: 'boolean', special: ['cast-boolean'], ...meta }, schema: { default_value: def } });
const image = (field, meta = {}) => ({
  field, type: 'uuid',
  meta: { interface: 'file-image', special: ['file'], display: 'image', options: { folder: uploadFolder }, ...meta },
  schema: {},
  relation: { related_collection: 'directus_files', schema: { on_delete: 'SET NULL' } },
});
const status = () => ({
  field: 'status', type: 'string',
  meta: {
    interface: 'select-dropdown', width: 'half', display: 'labels',
    options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }, { text: 'Archived', value: 'archived' }] },
    display_options: {
      choices: [
        { text: 'Published', value: 'published', foreground: '#FFFFFF', background: '#2ECDA7' },
        { text: 'Draft', value: 'draft', foreground: '#18222F', background: '#D3DAE4' },
        { text: 'Archived', value: 'archived', foreground: '#FFFFFF', background: '#A2B5CD' },
      ],
    },
  },
  schema: { default_value: 'draft', is_nullable: false },
});
const dateCreated = () => ({
  field: 'date_created', type: 'timestamp',
  meta: { special: ['date-created'], interface: 'datetime', readonly: true, hidden: true, width: 'half', display: 'datetime', display_options: { relative: true } },
  schema: {},
});
const dateUpdated = () => ({
  field: 'date_updated', type: 'timestamp',
  meta: { special: ['date-updated'], interface: 'datetime', readonly: true, hidden: true, width: 'half', display: 'datetime', display_options: { relative: true } },
  schema: {},
});
const blockHeader = () => [
  str('title', { note: 'Small label above the headline (optional)', width: 'half' }),
  str('headline', { note: 'Wrap words in <em> to highlight them', width: 'half' }),
];

// ---------------------------------------------------------------- schema

function collections() {
  return [
    {
      collection: 'posts',
      meta: {
        icon: 'article', note: 'Blog posts', display_template: '{{title}}', sort: 3,
        archive_field: 'status', archive_value: 'archived', unarchive_value: 'draft',
        preview_url: 'https://espressos.work/blog/{{slug}}?preview=true', versioning: true,
      },
      fields: [
        uuidPk(),
        status(),
        { ...bool('featured', false, { width: 'half', note: 'Pin to the top of the blog' }) },
        str('title', { required: true }, { is_nullable: false }),
        str('slug', {
          required: true, width: 'half', options: { slug: true, trim: true },
          note: 'URL part, e.g. "my-first-post" → /blog/my-first-post',
        }, { is_nullable: false, is_unique: true }),
        { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half', note: 'Leave empty to use the time it was published' }, schema: {} },
        image('cover_image', { note: 'Shown on the blog list and as the social sharing image' }),
        text('excerpt', { note: 'One or two sentences for the blog list and search results' }),
        html('content'),
        { field: 'tags', type: 'json', meta: { interface: 'tags', special: ['cast-json'], width: 'half', options: { lowercase: true, trim: true } }, schema: {} },
        str('author_name', { width: 'half', note: 'Defaults to the site name' }),
        { field: 'seo_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'SEO (optional)', icon: 'travel_explore' } } },
        str('seo_title', { width: 'half', note: 'Overrides the title in search results' }),
        text('seo_description', { width: 'half', note: 'Overrides the excerpt in search results (~155 characters)' }),
        dateCreated(),
        dateUpdated(),
      ],
    },
    {
      collection: 'blog_page',
      meta: { icon: 'menu_book', singleton: true, note: 'Blog index page copy', sort: 4 },
      fields: [
        intPk(),
        str('eyebrow', { width: 'half' }),
        str('headline', { width: 'half' }),
        text('description'),
        int('posts_per_page', 9, { width: 'half' }),
      ],
      seed: { eyebrow: 'Journal', headline: 'The <em>Blog</em>', description: 'Notes, process, and the occasional rabbit hole.', posts_per_page: 9 },
    },
    {
      collection: 'block_youtube',
      meta: { icon: 'smart_display', hidden: true, note: 'Latest videos from a YouTube channel', display_template: '{{headline}}' },
      fields: [
        uuidPk(),
        ...blockHeader(),
        str('channel', { required: true, note: 'Channel ID (UC…) or a youtube.com/channel/UC… URL' }),
        int('limit', 6, { width: 'half', note: 'How many videos to show (max 15)' }),
        bool('include_shorts', true, { width: 'half' }),
      ],
    },
    {
      collection: 'block_posts',
      meta: { icon: 'feed', hidden: true, note: 'Latest blog posts', display_template: '{{headline}}' },
      fields: [uuidPk(), ...blockHeader(), int('limit', 3, { width: 'half' })],
    },
    {
      collection: 'block_links',
      meta: { icon: 'link', hidden: true, note: 'Social links from the Links collection', display_template: '{{headline}}' },
      fields: [uuidPk(), ...blockHeader()],
    },
    {
      collection: 'block_activity',
      meta: { icon: 'dynamic_feed', hidden: true, note: 'Recent YouTube uploads and blog posts in one feed', display_template: '{{headline}}' },
      fields: [
        uuidPk(),
        ...blockHeader(),
        str('youtube_channel', { note: 'Channel ID (UC…) or youtube.com/channel/UC… URL. Leave empty to skip videos.' }),
        bool('include_posts', true, { width: 'half', note: 'Include blog posts' }),
        int('limit', 6, { width: 'half', note: 'How many items to show (max 24)' }),
      ],
    },
  ];
}

const DESIGN = JSON.parse(readFileSync(new URL('../shared/design.json', import.meta.url), 'utf8'));
const label = (translation) => [{ language: 'en-US', translation }];

const scale = (field, title, note, [min, max] = [70, 130]) => ({
  field, type: 'integer',
  meta: {
    interface: 'slider', width: 'half', note, translations: label(title),
    options: { minValue: min, maxValue: max, stepInterval: 5, alwaysShowValue: true },
    display: 'formatted-value', display_options: { suffix: '%' },
  },
  schema: {},
});

const color = (field, title, note) => ({
  field, type: 'string',
  meta: { interface: 'select-color', width: 'half', note, translations: label(title) },
  schema: {},
});

const font = (field, title, note) => ({
  field, type: 'string',
  meta: {
    interface: 'select-dropdown', width: 'half', note, translations: label(title),
    options: { allowNone: true, choices: DESIGN.fonts.map((f) => ({ text: `${f.name} (${f.kind})`, value: f.name })) },
  },
  schema: {},
});

/**
 * The "Design" group: colors, sizes, fonts and width. On the site settings these are the
 * defaults; everywhere else an empty value inherits from the site.
 */
function designFields(inherit) {
  const empty = inherit ? ' Empty = site default.' : '';
  return [
    {
      field: 'design', type: 'alias',
      meta: {
        interface: 'group-detail', special: ['alias', 'no-data', 'group'], translations: label('Design'),
        options: { start: inherit ? 'closed' : 'open', headerIcon: 'palette' },
        note: inherit ? 'Override the site look for this item.' : 'Default look for the whole site.',
      },
    },
    color('color_background', 'Background color', `Page background.${empty}`),
    color('color_text', 'Text color', `Body text and headings.${empty}`),
    color('color_primary', 'Primary color', `Cards, borders and highlighted words.${empty}`),
    color('color_accent', 'Accent color', `Buttons, links and active tabs.${empty}`),
    color('color_secondary', 'Secondary color', `Extra theme color.${empty}`),
    scale('text_scale', 'Text size', `100% = default.${empty}`),
    scale('heading_scale', 'Heading size', `Size of big headlines, on top of text size.${empty}`, [50, 150]),
    scale('spacing_scale', 'Spacing', `Lower = more compact.${empty}`, [50, 150]),
    scale('radius_scale', 'Corner roundness', `0% = sharp corners.${empty}`, [0, 200]),
    font('heading_font', 'Heading font', `Font for headlines.${empty}`),
    font('body_font', 'Body font', `Font for everything else.${empty}`),
    {
      field: 'content_width', type: 'string',
      meta: {
        interface: 'select-dropdown', width: 'half', translations: label('Content width'), note: `How wide the content can get.${empty}`,
        options: { allowNone: true, choices: Object.keys(DESIGN.contentWidths).map((w) => ({ text: w[0].toUpperCase() + w.slice(1), value: w })) },
      },
      schema: {},
    },
  ].map((f, i) => (i === 0 ? f : { ...f, meta: { ...f.meta, group: 'design', sort: i } }));
}

function extraFields() {
  return {
    site_settings: [
      { field: 'seo_divider', type: 'alias', meta: { interface: 'presentation-divider', special: ['alias', 'no-data'], options: { title: 'Site & SEO', icon: 'travel_explore' } } },
      str('site_name', { width: 'half' }),
      str('twitter_handle', { width: 'half', note: 'e.g. @JamieNNeedham — used for X/Twitter cards' }),
      text('site_description', { note: 'Default description for search engines and link previews' }),
      image('og_image', { note: 'Default image for link previews (1200×630 works best)' }),
      {
        field: 'navigation', type: 'json',
        meta: {
          interface: 'list', special: ['cast-json'], note: 'Header menu. Leave empty for the default menu.',
          options: {
            template: '{{label}} → {{url}}',
            fields: [
              { field: 'label', name: 'Label', type: 'string', meta: { field: 'label', interface: 'input', width: 'half', required: true } },
              { field: 'url', name: 'URL', type: 'string', meta: { field: 'url', interface: 'input', width: 'half', required: true, note: '/blog or https://…' } },
            ],
          },
        },
        schema: {},
      },
      text('footer_text', { note: 'Small print in the footer' }),
      ...designFields(false),
    ],
    pages: [
      text('seo_description', { note: 'Description for search engines and link previews' }),
      image('seo_image', { note: 'Link preview image for this page' }),
      ...designFields(true),
    ],
    posts: designFields(true),
    links_page: designFields(true),
    testimonials_page: designFields(true),
    links: [
      str('description', { note: 'Shown under the title' }),
      str('icon', { width: 'half', note: 'Optional Iconify name, e.g. simple-icons:youtube. Detected from the URL when empty.' }),
    ],
  };
}

const PUBLIC_POLICY_NAME = '$t:public_label';
const EDITOR_POLICY_NAME = 'Editor';

// ---------------------------------------------------------------- steps

async function ensureField(collection, def) {
  if (await exists(`/fields/${collection}/${def.field}`)) {
    // Existing fields (e.g. the original page colors) are moved into their group; data is untouched.
    if (def.meta?.group) {
      const current = await api('GET', `/fields/${collection}/${def.field}`);
      if (current.meta?.group !== def.meta.group) {
        console.log(`~ field ${collection}.${def.field} → ${def.meta.group} group`);
        const { group, sort, note, translations, width, options } = def.meta;
        await api('PATCH', `/fields/${collection}/${def.field}`, { meta: { group, sort, note, translations, width, ...(options && !current.meta?.options ? { options } : {}) } });
      }
    }
    return;
  }
  const { relation, ...field } = def;
  console.log(`+ field ${collection}.${def.field}`);
  await api('POST', `/fields/${collection}`, field);
  if (relation) {
    await api('POST', '/relations', { collection, field: def.field, ...relation, meta: { sort_field: null } });
  }
}

async function ensureCollection({ collection, meta, fields, seed }) {
  if (!(await exists(`/collections/${collection}`))) {
    console.log(`+ collection ${collection}`);
    const plain = fields.filter((f) => !f.relation).map(({ relation, ...f }) => f);
    await api('POST', '/collections', { collection, meta, schema: {}, fields: plain });
  }
  for (const f of fields) await ensureField(collection, f);

  if (seed && meta.singleton) {
    const current = await api('GET', `/items/${collection}`).catch(() => null);
    if (!current || !current.id) {
      console.log(`+ seed ${collection}`);
      await api('PATCH', `/items/${collection}`, seed);
    }
  }
}

async function ensurePermission(policy, collection, action, extra = {}) {
  const found = await api('GET', `/permissions?filter[policy][_eq]=${policy}&filter[collection][_eq]=${collection}&filter[action][_eq]=${action}&fields=id`);
  if (found?.length) return;
  console.log(`+ permission ${collection}.${action} (${policy === ids.public ? 'public' : 'editor'})`);
  await api('POST', '/permissions', { policy, collection, action, fields: ['*'], permissions: {}, ...extra });
}

const ids = { public: null, editor: null };

// Where each collection previews. `{{slug}}` etc. are filled in by Directus.
const PREVIEW_PATHS = {
  pages: '{{slug}}',
  posts: '/blog/{{slug}}',
  blog_page: '/blog',
  links: '/links',
  links_page: '/links',
  testimonials: '/testimonials',
  testimonials_page: '/testimonials',
  site_settings: '/',
};

/**
 * Preview URLs carry `preview=true` (skip the cache) and, when NUXT_PREVIEW_SECRET is set,
 * the secret that lets the site show drafts and unsaved content versions.
 */
async function ensurePreviewUrls() {
  const site = (process.env.PREVIEW_SITE_URL || 'https://espressos.work').replace(/\/$/, '');
  const secret = process.env.NUXT_PREVIEW_SECRET;
  const params = `preview=true${secret ? `&token=${encodeURIComponent(secret)}` : ''}`;

  for (const [collection, path] of Object.entries(PREVIEW_PATHS)) {
    const current = await api('GET', `/collections/${collection}`).catch(() => null);
    if (!current) continue;
    const version = current.meta?.versioning ? '&version={{$version}}' : '';
    const url = `${site}${path}?${params}${version}`;
    if (current.meta?.preview_url !== url) {
      console.log(`~ preview URL ${collection}`);
      await api('PATCH', `/collections/${collection}`, { meta: { preview_url: url } });
    }
  }

  const settings = await api('GET', '/settings?fields=visual_editor_urls');
  const editorUrl = `${site}/?${params}`;
  if (settings?.visual_editor_urls?.[0]?.url !== editorUrl) {
    console.log('~ visual editor URL');
    await api('PATCH', '/settings', { visual_editor_urls: [{ url: editorUrl }] });
  }
}

async function main() {
  console.log(`Directus: ${BASE}${DRY ? ' (dry run)' : ''}`);

  const folders = await api('GET', '/folders?fields=id,name&limit=-1');
  uploadFolder = folders.find((f) => f.name === UPLOAD_FOLDER_NAME)?.id ?? null;

  const policies = await api('GET', '/policies?fields=id,name&limit=-1');
  ids.public = policies.find((p) => p.name === PUBLIC_POLICY_NAME)?.id;
  ids.editor = policies.find((p) => p.name === EDITOR_POLICY_NAME)?.id;

  for (const c of collections()) await ensureCollection(c);
  for (const [collection, fields] of Object.entries(extraFields())) {
    for (const f of fields) await ensureField(collection, f);
  }

  // Allow the new blocks in the page builder.
  const rel = await api('GET', '/relations/pages_blocks/item');
  const allowed = new Set(rel.meta.one_allowed_collections ?? []);
  const wanted = ['block_youtube', 'block_posts', 'block_links', 'block_activity'];
  if (wanted.some((c) => !allowed.has(c))) {
    console.log('+ page builder blocks', wanted.filter((c) => !allowed.has(c)).join(', '));
    await api('PATCH', '/relations/pages_blocks/item', { meta: { one_allowed_collections: [...new Set([...allowed, ...wanted])] } });
  }

  // Permissions.
  if (ids.public) {
    await ensurePermission(ids.public, 'posts', 'read', { permissions: { status: { _eq: 'published' } } });
    for (const c of ['blog_page', 'block_youtube', 'block_posts', 'block_links', 'block_activity']) await ensurePermission(ids.public, c, 'read');

    // Close the moderation bypass: public submissions may not choose their own status.
    const publicCreate = await api('GET', `/permissions?filter[policy][_eq]=${ids.public}&filter[collection][_eq]=testimonials&filter[action][_eq]=create&fields=id,validation`);
    for (const p of publicCreate ?? []) {
      if (!p.validation?.status) {
        console.log('~ restrict public testimonial submissions to draft');
        await api('PATCH', `/permissions/${p.id}`, {
          fields: ['name', 'subject', 'quote', 'image_url', 'status'],
          presets: { status: 'draft' },
          validation: { status: { _eq: 'draft' } },
        });
      }
    }
  }
  if (ids.editor) {
    for (const c of ['posts', 'block_youtube', 'block_posts', 'block_links', 'block_activity']) {
      for (const action of ['create', 'read', 'update', 'delete']) await ensurePermission(ids.editor, c, action);
    }
    for (const action of ['read', 'update']) await ensurePermission(ids.editor, 'blog_page', action);
  }

  await ensurePreviewUrls();

  console.log('Done.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
