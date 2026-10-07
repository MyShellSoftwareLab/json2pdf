# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this project is

`pdf-creator` turns a JSON array of report **elements** into a styled A4 PDF report. It ships two things from one codebase:

1. **An Express API** (`src/server.ts`, `src/app.ts`). It validates the elements, then Puppeteer opens the pre-built Vue app (`dist-app/index.html`), injects the data as `window.__PDF_ELEMENTS__`, waits for `window.RENDER_COMPLETE`, and prints to PDF.
2. **A Vue component library** (`src/index.ts`, built to `dist/`) that exports `Elements`, `ChartItem`, `RichText` and the `PdfElement` type, so other frontends can render the same elements.

Stack: TypeScript, Vue 3 (`<script setup>`, SFCs), ECharts 5 (SVG renderer, animations off), Puppeteer, Express 5, Vite 7. Run it with Node through `ts-node` (CommonJS, see `tsconfig.json`).

## Commands

```bash
npm install
npm start            # build:app, then nodemon + ts-node src/server.ts
npm run build:app    # Vite build of the render app -> dist-app/ (what Puppeteer loads)
npm run build:lib    # Vite library build -> dist/ (ES + UMD + .d.ts)
npm run build:server # tsc -> dist-server/ (compiled API for production)
npm run build        # lib + app + server
npm run serve        # node dist-server/server.js (what pm2 runs, see ecosystem.config.js)
npx ts-node src/test-api.ts   # POST src/exampleData.json to a running server -> output.pdf
npx tsc --noEmit              # type-check (there is no lint or test suite)
```

`npm test` is a placeholder that fails on purpose, so there are no automated tests. To verify a change, render it (see below).

### Important: rebuild the render app after frontend changes

Puppeteer renders from the **built** `dist-app/`, not from `src/`. nodemon only watches `src` and restarts the Node server. It does **not** rebuild the Vue app. After editing anything under `src/components/`, `src/theme.ts`, `src/icons.ts`, `src/base.css`, `src/render-app.ts` or `index.html`, run `npm run build:app` before you check the PDF.

### Port

`src/server.ts` uses `process.env.PORT || 3000`. The README and `src/test-api.ts` assume `8003`, which is set through the local `.env` (gitignored). Don't commit `.env`.

## Verifying visual changes

With the server running:

- `GET /design-preview`: PDF with one of every element type (`src/data/elementsOneOfEach.ts`).
- `GET /design-preview-html`: the same content as raw HTML, for inspection in browser devtools.
- `POST /api/generate-pdf` with `{ "elements": [...], "options": {...} }`: the real endpoint. It returns `400` with `details` when validation fails.
- `GET /`: the public docs, which are `README.md` rendered by `services/docs.ts`. Editing the README updates the site; keep heading text stable, because sidebar anchors are GitHub-style slugs.

## Layout

```
src/
  server.ts / app.ts        Express entry + routes
  services/pdfGenerator.ts  Puppeteer: viewport = printable area, file:// load, waits RENDER_COMPLETE, prints
  services/pdfOptions.ts    Validates/normalizes the payload's `options` (format, margins, header/footer, ...) -> Puppeteer PDFOptions + viewport
  services/validator.ts     Per-type payload validation (switch on element.type)
  types.ts                  PdfElement discriminated union + all element interfaces
  render-app.ts             Browser entry for dist-app; mounts Elements, sets RENDER_COMPLETE
  index.ts                  Library entry (public exports)
  components/
    Elements.vue            Dispatcher: maps element.type -> component, handles page breaks
    RichText.vue            Renders inline HTML/rich content inside text elements
    chartOptionBuilders.ts  ECharts option builders per chart type, severity colors, palette
    elements/*.vue          One component per element type
  theme.ts                  Reads design tokens (theme.X <-> --x CSS variable) from the active theme at load time
  apply-theme.ts            Injects window.__PDF_THEME_CSS__ as a <style>; imported FIRST by render-app.ts
  services/themes.ts        Lists/loads themes: themes/custom/<name>.css first, then themes/<name>.css (default always first, chosen theme on top)
  icons.ts                  Lucide SVG paths -> data URIs (dimension/department icons)
  data/elementsOneOfEach.ts Design-preview fixture covering every element
  exampleData.json          Sample payload for test-api.ts
themes/                     Built-in theme CSS files: tokens as CSS variables + optional `.pdf ...` override rules
themes/custom/              Per-installation themes, git-ignored (*.css). Never commit client themes; only its README is tracked
```

## Adding or changing an element type

Keep these places in sync:

1. **`src/types.ts`**: add the interface (extend `BaseElement` with a literal `type`) and add it to the `PdfElement` union.
2. **`src/services/validator.ts`**: add a `case` with the required-field checks. Unknown types are silently ignored, so a missing case means there's no validation.
3. **Component**: `src/components/elements/<Name>.vue`, or for charts, a builder in `chartOptionBuilders.ts` that `ChartItem.vue` uses.
4. **`src/components/Elements.vue`**: import it and add a `v-else-if` branch. Chart types also go in the `ChartItem` type list there. Table- and card-like elements guard against empty `rows`/`cards` so nothing renders when there's no data.
5. **`src/data/elementsOneOfEach.ts`**: add a sample so `/design-preview` shows it.
6. **`README.md`** ("Supported Element Types").

## Conventions

- **Components**: `<script setup lang="ts">`, `defineProps<{ element: XElement }>()`, scoped styles, BEM-style classes (`el-subtitle`, `pdf__block--<type>`).
- **Styling / themes**: token VALUES live in `themes/default.css` (CSS variables), not in code. `theme.ts` exports one constant per token, read at module load from the theme CSS that `apply-theme.ts` injected (falling back to the bundled `default.css` outside the PDF page). Components use `v-bind('theme.X')` in CSS and builders use `theme.X`. Don't hardcode colors: add a token to `default.css` + an export in `theme.ts`. Other themes (`themes/blue.css`) only override tokens and may add `.pdf <selector>` rules, which win over scoped component styles because the theme `<style>` is appended last. Chart color tokens must stay hex. For translucent tints use `hexToRgba(theme.X, a)` in TS or `color-mix(in srgb, v-bind('theme.X') N%, transparent)` in CSS. The font is Inter (Google Fonts in `index.html`). Check both `/design-preview` and `/design-preview?theme=blue` after visual changes.
- **Severity**: the levels are `success | warning | error | info`. Score thresholds (≥70 success, ≥55 warning, else error) live in `chartOptionBuilders.ts`. Reuse the existing helper and don't add new thresholds.
- **Charts**: ECharts with `renderer: 'svg'` and `animation = false`, so the PDF is captured fully drawn. Anything async in rendering has to finish before `RENDER_COMPLETE` is set (`render-app.ts`).
- **Print layout**: use CSS `break-before` / `break-inside`. Page breaks between blocks are computed in `Elements.vue` (`blocks`): a `title` or a preceding `{ "type": "page_break" }` marks the next block `pdf__break-before`, except for the first block and the block right after `cover_page`. `page_break` never renders its own section, so it can't produce blank pages. `cover_page` handles its own full-bleed page: `page: cover` + `@page cover { margin: 0 }` (base.css) give it a zero-margin sheet, and `100vw`/`100vh` resolve against that sheet when printing (`margin-left: calc(50% - 50vw)` reaches the left edge because all containers are centered).
- **Icons**: add Lucide path strings to `icons.ts` (copied verbatim from `lucide-vue-next`) instead of hand-drawn SVGs.
- **Language**: code identifiers are English. Many code comments and sample report text are Spanish, so match the language of the surrounding comments.
- **`html` element (Tailwind)**: `services/tailwind.ts` compiles Tailwind v4 server-side per report, using the `class` attributes of every `html` element as candidates. The preflight reset and utilities are wrapped in `@scope (.el-html)`, so they only touch that element's content. The CSS reaches the page as `window.__PDF_TAILWIND_CSS__` (injected by `pdfGenerator.ts` and `/design-preview-html`, applied in `render-app.ts`). `HtmlContent.vue` sanitizes with DOMPurify. Keep both the scoping and the sanitizing: Puppeteer runs with file:// access.
- **PDF options**: `resolvePdfOptions()` in `services/pdfOptions.ts` turns the payload's optional `options` (including `theme`) into Puppeteer `PDFOptions` plus a viewport equal to the printable area ((page − margins) / scale). The cover's `min-height: 100vh` and chart widths depend on that, so don't hardcode page dimensions anywhere. New options need validation there, a row in the README's "PDF options" table, and they also work as `/design-preview` query params via `optionsFromQuery()` in `app.ts`.
- **Cover logo**: `cover_page` takes an optional `logo` (URL or data URI). No logo is bundled.
- **Library surface**: changes to `src/index.ts`, `types.ts` or `theme.ts` affect downstream consumers via `dist/` types. Keep exports backward compatible.

## Git

- Work on `develop`. PRs target `main`, and feature branches look like `feat/...`, `fix/...`, `feature/...`.
- Commit messages: Conventional Commits, often with a gitmoji, e.g. `feat: :sparkles: ...`, `fix: :bug: ...`, `cosmetic: 💄 ...`.
- Don't commit `dist/`, `dist-app/`, `output.pdf` or `.env` (all gitignored).
