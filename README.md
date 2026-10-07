# json2pdf

Turn a JSON array of report **elements** into a print-ready PDF: A4, Letter or a custom size, portrait or landscape.

Send titles, paragraphs, tables, metrics, charts, or raw HTML styled with **Tailwind CSS**, and get back a PDF. Rendering happens in headless Chromium (Puppeteer), so what you'd see in a browser is what you get on paper.

- **Hosted API:** `https://json2pdf.guss.uk/api/generate-pdf` (docs at [json2pdf.guss.uk](https://json2pdf.guss.uk))
- **Self-hosted:** run your own instance with Node.js and pm2 (see [Self-hosting](#self-hosting)).

## Features

- **JSON in, PDF out.** One endpoint: `POST /api/generate-pdf`.
- **Built-in elements:** cover page, titles, paragraphs, lists, tables (with badges, progress bars and heatmap cells), metric cards, and charts (bar, line, pie, doughnut, radar, horizontal bar, stacked bar, gauge, scatter), all rendered with ECharts.
- **HTML + Tailwind CSS:** the `html` element accepts any HTML with Tailwind v4 classes (grid, flex, tables, gradients, arbitrary values like `w-[120px]`). Only the classes you use are compiled, and they never leak into the other elements.
- **Page control:** page size, orientation, margins, scale, page numbers, custom header/footer, PDF title and bookmarks (see [PDF options](#pdf-options)), plus `page_break` elements and automatic page breaks before each `title`.
- **Themes:** the whole look (colors, fonts, radius, decorative shapes) lives in plain CSS files. Pick one per request with `"theme": "blue"`, or add your own (see [Themes](#themes)).
- **Validation:** malformed payloads get a `400` with a per-element list of what's wrong.

---

## Using the API

### `POST /api/generate-pdf`

**Request:** `Content-Type: application/json`, with a body containing an `elements` array and an optional `options` object (max 50 MB total):

```json
{
  "elements": [
    { "type": "cover_page", "title": "Quarterly Report", "subtitle": "Acme Corp", "footer": "Generated on 2026-10-06" },
    { "type": "title", "content": "Summary" },
    { "type": "paragraph", "content": "Revenue grew <strong>12%</strong> this quarter." },
    { "type": "metric", "title": "Revenue", "value": "$48.2k", "severity": "success", "interpretation": "Above target" },
    { "type": "bar_chart", "title": "Sales by month", "data": [{ "label": "Jan", "value": 120 }, { "label": "Feb", "value": 180 }] },
    { "type": "html", "content": "<div class=\"rounded-xl bg-blue-50 p-4 text-blue-900\">Any <b>Tailwind</b> markup</div>" }
  ],
  "options": {
    "format": "Letter",
    "landscape": false,
    "margin": "15mm",
    "pageNumbers": true,
    "title": "Quarterly Report",
    "filename": "q3-report"
  }
}
```

**Responses:**

| Status | Body | When |
|---|---|---|
| `200` | The PDF (`application/pdf`, `Content-Disposition: attachment; filename="report.pdf"` by default) | Success |
| `400` | `{ "error": "Validation Failed", "details": [{ "errors": ["..."], "element": { ... } }] }` | One or more elements or `options` are invalid. Option errors are prefixed with `options:`. |
| `400` | Plain text | The body has no `elements` array |
| `500` | Plain text with the error message | Rendering failed |

Elements with an unknown `type` are ignored and don't cause an error.

### PDF options

Everything in `options` is optional. Without it you get the default: A4 portrait, 20px margins, backgrounds printed, downloaded as `report.pdf`.

| Option | Type | Default | Description |
|---|---|---|---|
| `format` | string | `"A4"` | Page size: `A0`–`A6`, `Letter`, `Legal`, `Tabloid`, `Ledger` (case-insensitive). |
| `width`, `height` | length | none | Custom page size, e.g. `"200mm"` and `"150mm"`. Set both; they replace `format`. |
| `landscape` | boolean | `false` | Landscape orientation. |
| `margin` | length or object | `"20px"` | One value for all sides (`"15mm"`), or per side: `{ "top": "1cm", "right": 30, "bottom": "15mm", "left": "0.5in" }`. Sides you leave out stay at `20px`. The cover page always has no margins. |
| `scale` | number | `1` | Zoom the content, from `0.1` to `2`. `0.8` fits more per page, `1.2` makes everything bigger. |
| `printBackground` | boolean | `true` | Print background colors and images. `false` gives a printer-friendly, ink-saving PDF. |
| `pageRanges` | string | all pages | Only include some pages, e.g. `"1-3, 5"`. |
| `pageNumbers` | boolean or object | `false` | `true` prints "Page N of M" centered in the footer. Customize it with `{ "format": "Página {page} de {total}", "align": "left\|center\|right", "position": "footer\|header" }`. |
| `headerTemplate`, `footerTemplate` | HTML string | none | A custom header/footer on every page (see below). Takes priority over `pageNumbers` on the same side. |
| `title` | string | `"Report"` | PDF document title, shown in PDF viewers' title bars. |
| `theme` | string | `"default"` | Visual theme: `default`, `blue`, `fumisan`, or any theme added to `themes/` (see [Themes](#themes)). `GET /api/themes` lists them. |
| `outline` | boolean | `false` | Add PDF bookmarks generated from the document's headings (cover, `title` elements, and headings inside `html` elements). |
| `filename` | string | `"report"` | Download filename. `.pdf` is added automatically, and unsafe characters are removed. |
| `disposition` | string | `"attachment"` | `"inline"` makes browsers open the PDF instead of downloading it. |

**Lengths** can be a number (pixels) or a string with a unit: `px`, `mm`, `cm` or `in` (e.g. `20`, `"20px"`, `"12.5mm"`, `"1in"`).

Charts, the cover page and the HTML elements adapt to the printable area, so a landscape or Letter PDF is laid out for that page, not stretched from A4.

#### Custom header and footer

`headerTemplate` and `footerTemplate` are HTML. Chromium fills these classes in on each page:
- `pageNumber`
- `totalPages`
- `title` (your `title` option)
- `date`

```json
{
  "options": {
    "title": "Quarterly Report",
    "margin": { "top": "25mm", "bottom": "20mm" },
    "headerTemplate": "<div style=\"font-size:9px;width:100%;padding:0 20px;display:flex;justify-content:space-between;color:#6b7280\"><span class=\"title\"></span><span class=\"date\"></span></div>",
    "footerTemplate": "<div style=\"font-size:9px;width:100%;text-align:right;padding:0 20px\"><span class=\"pageNumber\"></span> / <span class=\"totalPages\"></span></div>"
  }
}
```

Things to keep in mind:
- Header and footer HTML doesn't load external CSS, fonts or Tailwind. Use inline `style` attributes, and always set a `font-size`, since the default is tiny.
- They're drawn inside the top and bottom margins. When a header or footer is on, that margin defaults to `48px`; set a bigger margin if your template needs more room.
- They also print on the cover page, which has no margins, so there they overlap the cover's bottom (or top) edge. Chromium can't skip a page, so keep cover content away from that edge if you use them.

### Themes

Every element's look comes from a **theme**: a CSS file in the `themes/` folder. Choose one per PDF:

```json
{ "elements": [ ... ], "options": { "theme": "blue" } }
```

Try them on the full sample document: [`/design-preview?theme=default`](https://json2pdf.guss.uk/design-preview?theme=default) and [`/design-preview?theme=blue`](https://json2pdf.guss.uk/design-preview?theme=blue). Other options combine too, e.g. `/design-preview?theme=blue&landscape=true`.

| Theme | Look |
|---|---|
| `default` | Monochrome: dark grays on a white page for text, tables and charts. The only color is the severity green / amber / red, in quieter dark tones. |
| `blue` | Blue on blue: deep-blue cover with large circles, a gradient pill under titles, dots before subtitles, blue charts and tables on rounded cards. |
| `fumisan` | The SISFUM / FUMISAN brand: the `blue` layout in the customer portal's colors, with a navy cover and table headers (`#293C91`), blue accents (`#0F70B7`) and the portal's green / amber / red for severity. |

#### Creating a theme

On a self-hosted instance, add a file to `themes/` (e.g. `themes/forest.css`) and request `"theme": "forest"`. No restart or rebuild is needed. `themes/default.css` is always loaded first and your theme on top of it, so a theme only declares what it changes. A theme can do two things:

1. **Override design tokens.** These are CSS variables that every element and chart reads: colors (`--primary-50` … `--primary-700`, `--secondary-*`, `--surface-*`, `--chart-success`, `--chart-palette-1` … `--chart-palette-8` for chart series, `--heatmap-*`…), typography (`--font-family`, `--font-size-title`, `--font-weight-bold`…), spacing and radius (`--space-*`, `--radius-*`). See `themes/default.css` for the full list.

   ```css
   :root {
     --primary-500: #16A34A;
     --secondary-500: #14532D;
     --radius-md: 4px;
   }
   ```

2. **Restyle elements with regular CSS rules.** Prefix selectors with `.pdf` so they win over the elements' built-in styles:

   ```css
   .pdf .el-title { text-transform: uppercase; }
   .pdf .cover { background: #14532D; }
   ```

   Useful classes: `.cover` (and `.cover__title`, `__subtitle`, `__badge`, `__footer`), `.el-title`, `.el-subtitle`, `.el-table`, `.metric`, `.chart-block--simple`, `.panel`. Inspect `/design-preview-html?theme=<name>` with browser devtools to find others.

Things to keep in mind:
- **Colors used by charts must be hex** (`#RRGGBB`). Charts derive transparent tints from them.
- **Custom fonts:** set `--font-family` and load the font with an `@import` or `@font-face` at the top of the theme. Rendering waits until fonts finish loading.
- **Names** may only use letters, numbers, `-` and `_`. Unknown names return a `400` listing the available themes.

### Examples

**curl**

```bash
curl -X POST https://json2pdf.guss.uk/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"elements":[{"type":"title","content":"Hello"},{"type":"paragraph","content":"My first PDF"}]}' \
  -o report.pdf
```

**JavaScript (Node 18+ / browser)**

```js
const res = await fetch('https://json2pdf.guss.uk/api/generate-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    elements: [
      { type: 'title', content: 'Hello' },
      { type: 'paragraph', content: 'My first PDF' },
    ],
  }),
});

if (!res.ok) throw new Error(await res.text());
const pdf = Buffer.from(await res.arrayBuffer()); // in Node; use res.blob() in the browser
require('fs').writeFileSync('report.pdf', pdf);
```

**Python**

```python
import requests

res = requests.post(
    "https://json2pdf.guss.uk/api/generate-pdf",
    json={"elements": [{"type": "title", "content": "Hello"}, {"type": "paragraph", "content": "My first PDF"}]},
    timeout=60,
)
res.raise_for_status()
open("report.pdf", "wb").write(res.content)
```

For a self-hosted instance, replace `https://json2pdf.guss.uk` with your own URL (e.g. `http://localhost:8003`).

### Other routes

| Route | What it returns |
|---|---|
| `GET /` | This documentation, rendered from `README.md` |
| `GET /design-preview` | A PDF with one of every element type, so you can see what's available. It accepts [PDF options](#pdf-options) as query parameters, e.g. `/design-preview?format=Letter&landscape=true&margin=15mm&pageNumbers=true`. |
| `GET /design-preview-html` | The same document as HTML, before it's printed, to inspect with browser devtools. Accepts `?theme=` too. |
| `GET /api/themes` | The available themes, e.g. `{ "themes": ["default", "blue"] }` |

---

## Element reference

Every element is an object with a `type`. Text fields (`content`, `subtitle`, …) accept simple inline HTML such as `<strong>` and `<br>`.

### Layout and text

| Type | Shape |
|---|---|
| `cover_page` | `{"type":"cover_page","title":"...","subtitle":"...","badge":"...","footer":"...","logo":"https://... or data:image/..."}`. Full-page cover, always printed edge to edge: its page has no margins, whatever `options.margin` says. Only `title` is required. `title` can also be an array of lines: `[{"text":"Annual"},{"text":"Report","accent":true}]`. |
| `title` | `{"type":"title","content":"..."}`. Starts a new page, unless it's the first element or follows the cover. |
| `subtitle` | `{"type":"subtitle","content":"..."}`. Stays on the same page as the element after it, so it's never left alone at the bottom of a page. |
| `paragraph` | `{"type":"paragraph","content":"..."}` |
| `numbered_list` | `{"type":"numbered_list","items":["...","..."]}` |
| `bullet_points` | `{"type":"bullet_points","items":["...","..."]}` |
| `page_break` | `{"type":"page_break"}`. The next element starts on a new page. It's ignored at the start, right after a cover, before a `title`, or at the end, so it never creates blank pages. |

### `html` (Tailwind CSS)

```json
{ "type": "html", "content": "<div class=\"grid grid-cols-3 gap-4\"><div class=\"rounded-xl bg-emerald-50 p-4\">...</div></div>" }
```

- Any **Tailwind CSS v4** class works: layout (`grid`, `flex`, `grid-cols-[1fr_2fr]`), colors, borders, shadows, gradients, variants like `odd:`/`even:`/`marker:`, and arbitrary values.
- The server compiles only the classes your content uses, and scopes the CSS to that element. Tailwind's reset never affects the other elements.
- The HTML is sanitized with DOMPurify before rendering: `<script>`, `on*` handlers and iframes are removed, while `class` and `style` are kept.
- The printed page is about 715px wide, so `sm:` variants apply but `md:` and wider don't. Write layouts for the page width (`grid-cols-3`, not `md:grid-cols-3`).

### Tables

```json
{
  "type": "table",
  "headers": ["Project", "Owner", "Status", "Progress"],
  "rows": [
    ["Invoice generator", "Paula Promise", { "text": "Done", "severity": "success", "variant": "soft" }, { "type": "progress", "value": 75 }]
  ]
}
```

By default the first column takes 22% of the width and the others split the rest evenly. Set `column_widths` to choose them, one per header:

```json
{
  "type": "table",
  "headers": ["Code", "Finding", "Pest", "Date"],
  "column_widths": ["18%", "40%", "22%", "20%"],
  "rows": [["ACC10001", "Gap in the wall next to the loading dock door", "Rats", "18/09/2026"]]
}
```

Each width is a percentage (`"40%"`), a length (`"120px"`, `"30mm"`, same units as [lengths](#pdf-options)) or a number of pixels. It must have as many values as `headers`. Long words only wrap when they don't fit, so give short codes and dates enough room.

A cell can be any of these:
- a string, a number, or `null`
- a badge: `{ "text", "severity": "success|warning|info|error", "variant": "outline|solid|soft", "cellFill": true }`. `cellFill` colors the whole cell.
- a progress bar: `{ "type": "progress", "value", "max", "label" }`
- an icon with text: `{ "type": "icon_label", "text", "icon" }`

Tables with no rows aren't rendered.

### Metrics

```json
{ "type": "metric", "title": "Revenue", "value": "$48.2k", "severity": "success", "interpretation": "Above target" }
```

`severity` is `success | warning | info | error`. Adding `max`, `badge` and `subStats` (`[{ "value", "label", "color": "danger|default" }]`) switches to a large dark "hero" card.

### Charts

| Type | Shape |
|---|---|
| `bar_chart` | `{"type":"bar_chart","title":"...","data":[{"label":"...","value":1}]}` |
| `pie_chart` | `{"type":"pie_chart","title":"...","data":[{"label":"...","value":1}]}` |
| `doughnut_chart` | `{"type":"doughnut_chart","title":"...","labels":["..."],"values":[1]}` |
| `radar_chart` | `{"type":"radar_chart","title":"...","labels":["..."],"values":[1],"max":100}` |
| `horizontal_bar` | `{"type":"horizontal_bar","title":"...","labels":["..."],"values":[1],"max":100}`. Optional `"variant":"severity_list"` with `iconKeys` and `legend`. |
| `stacked_bar` | `{"type":"stacked_bar","title":"...","data":[{"label":"Jan","values":{"A":1,"B":2}}]}` |
| `line_chart` | `{"type":"line_chart","title":"...","labels":["..."],"series":[{"name":"...","values":[1,null]}]}`. See [Line chart](#line-chart) below for axis, colors, dashes and bands. |
| `velocimeter` | `{"type":"velocimeter","title":"...","value":7,"min":0,"max":10}` (gauge) |
| `scatter_plot` | `{"type":"scatter_plot","title":"...","x_axis":"...","y_axis":"...","positions":[{"label":"...","x":1,"y":1}]}` |

#### Line chart

```json
{
  "type": "line_chart",
  "title": "Year-over-year risk",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  "series": [
    { "name": "2026", "values": [97, 96, 94.85, 92.5, 90, 87.5, 85, 82.5, 80, 77.5, null, null], "color": "#2563EB" },
    { "name": "2025", "values": [null, null, null, null, null, null, null, null, null, null, 99, 98], "color": "#9CA3AF", "dashed": true }
  ],
  "y_axis": { "min": 0, "max": 100, "label": "Risk" },
  "bands": [
    { "from": 0, "to": 30, "color": "#E8F6EC", "label": "Low" },
    { "from": 30, "to": 60, "color": "#FFF6DB", "label": "Medium" },
    { "from": 60, "to": 100, "color": "#FDECEE", "label": "High" }
  ]
}
```

| Field | Required | Description |
|---|---|---|
| `labels` | yes | X-axis categories. |
| `series` | yes | One or more lines. Each has a `name` (shown in the legend) and `values`, which must have the same length as `labels`. Optional: `color` (defaults to the theme palette) and `dashed: true`. |
| `values[i]` = `null` | | No data for that point. It leaves a gap instead of being drawn as 0 or joined across. Every point has a dot, so a single isolated value is still visible. |
| `y_axis` | no | `{ "min", "max", "label" }`. Fix the scale (e.g. 0–100) so charts are comparable; without it the axis scales to the data. `label` is the axis name. |
| `bands` | no | Colored horizontal zones behind the lines, e.g. traffic-light levels: `{ "from", "to", "color", "label" }`. The label is drawn at the right edge of each band. |

A `400` lists every problem, e.g. `Series 0 ('2026') has 10 values but 'labels' has 12.`

### Scorecard elements

These are richer, card-style components for scored reports. See `src/types.ts` for every field, and `src/data/elementsOneOfEach.ts` for working examples.

| Type | Purpose |
|---|---|
| `dimension_score_table` | Rows of named scores with bars, a threshold marker and a legend |
| `department_table` | Group × dimension comparison with an aggregated score column (`scoreLabel` sets its header) and heatmap cells |
| `indicator_dimension_grid` | Grid of cards, each with a score and a list of indicators |
| `findings_section` | Highlighted findings with an impact and a recommended action |
| `alerts_section` | Table of alerts with a risk bar, a level and an action |

Icon keys used by these elements:
- **Dimensions:** `skills, performance, growth_potential, digital_competency, automation_potential, culture_engagement, capacity, risk`
- **Departments:** `marketing, ventas, finanzas, administracion, operaciones, rrhh, tecnologia, legal, atencion, logistica, producto, generic`
- **Alerts:** `fuga_clave, burnout, potencial_atrapado, obsolescencia, lobo_solitario`

---

## Self-hosting

### Requirements

- **Node.js 20.19+** (22 LTS recommended) and npm
- **Linux server** (Ubuntu/Debian examples below) with the system libraries Chromium needs
- Outbound internet access while rendering, to load the Inter font from Google Fonts. Without it, PDFs fall back to Helvetica/Arial.
- Around **300–500 MB of RAM per PDF being rendered**, since each request launches its own Chromium

### 1. Install

```bash
git clone https://github.com/MyShellSoftwareLab/json2pdf.git
cd json2pdf
npm ci
```

`npm ci` also downloads the Chromium build that Puppeteer uses, into `~/.cache/puppeteer` of the **current user**. Run the app with pm2 as that same user.

On a fresh server, install Chromium's system dependencies (needs sudo):

```bash
sudo npx puppeteer browsers install chrome --install-deps
# optional, for emoji and non-Latin text:
sudo apt-get install -y fonts-noto-color-emoji fonts-noto-cjk
```

### 2. Configure

Create a `.env` file in the project root:

```bash
PORT=8003
```

The port defaults to `3000` if `PORT` isn't set.

### 3. Build

```bash
npm run build
```

This builds three things:
- `dist-app/`: the page that Chromium renders
- `dist-server/`: the compiled API server
- `dist/`: the Vue component library

### 4. Run with pm2

```bash
npm install -g pm2
pm2 start ecosystem.config.js   # starts "json2pdf" from dist-server/server.js on port 8003
pm2 save                        # remember the process list
pm2 startup                     # print the command that starts pm2 on boot, then run it
```

`ecosystem.config.js` sets `PORT=8003`, `NODE_ENV=production`, and restarts the app if it goes over 1 GB of memory. Edit it to change these.

Useful commands:

```bash
pm2 status
pm2 logs json2pdf
pm2 reload json2pdf
```

Without pm2, `npm run serve` runs the same compiled server in the foreground.

Check it works:

```bash
curl -o test.pdf http://localhost:8003/design-preview
```

### 5. Put it behind nginx with HTTPS (optional)

```nginx
# /etc/nginx/sites-available/json2pdf
limit_req_zone $binary_remote_addr zone=json2pdf:10m rate=30r/m;

server {
    server_name pdf.example.com;

    client_max_body_size 50m;          # matches the API's JSON limit

    location / {
        limit_req zone=json2pdf burst=10 nodelay;
        proxy_pass http://127.0.0.1:8003;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;       # large reports can take a while
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/json2pdf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pdf.example.com   # free TLS certificate from Let's Encrypt
```

### Security notes

- **There is no authentication built in.** Anyone who can reach the port can generate PDFs, and each request starts a Chromium process. On a public server, add rate limiting (as in the nginx example), and consider HTTP basic auth or an IP allowlist in nginx.
- The app listens on all interfaces. Firewall its port (e.g. `ufw allow 'Nginx Full'`, without opening `8003`) so traffic only goes through nginx.
- HTML from `html` elements is sanitized before rendering, but treat the service as something that renders untrusted input. Run it as an unprivileged user.

### Updating

```bash
git pull
npm ci
npm run build
pm2 reload json2pdf
```

---

## Development

```bash
npm install
npm start          # builds the render app, then runs the API with nodemon + ts-node on PORT (.env)
```

- Open `http://localhost:8003/design-preview` to see every element.
- **After changing anything under `src/components/`, `src/theme.ts` or `src/base.css`, run `npm run build:app` again.** The PDF is rendered from the built `dist-app/`, and nodemon only restarts the API.
- `npx ts-node src/test-api.ts` sends `src/exampleData.json` to a running server and saves `output.pdf`.
- `npx tsc --noEmit` type-checks the project. There's no test suite yet.

### Theming

Themes are CSS files in `themes/` (see [Themes](#themes)). Inside the code, components and chart builders read the tokens through `src/theme.ts` (`theme.PRIMARY_500` ↔ `--primary-500`), so new styles should use a token rather than a hardcoded value. To add a token, declare it in `themes/default.css` and export it from `src/theme.ts`.

### Adding an element

1. Add its interface to `src/types.ts` and to the `PdfElement` union.
2. Add a validation `case` in `src/services/validator.ts`.
3. Create the component in `src/components/elements/`. For charts, add a builder in `src/components/chartOptionBuilders.ts`.
4. Register it in `src/components/Elements.vue`.
5. Add a sample to `src/data/elementsOneOfEach.ts` and document it in this README.

### Project structure

```
src/
├── server.ts / app.ts          Express API (routes)
├── services/
│   ├── pdfGenerator.ts         Puppeteer: loads dist-app, injects data, prints the PDF
│   ├── pdfOptions.ts           Validates `options` (page size, margins, header/footer…)
│   ├── tailwind.ts             Compiles Tailwind CSS for `html` elements
│   ├── themes.ts               Lists and loads theme files
│   └── validator.ts            Per-element payload validation
├── components/
│   ├── Elements.vue            Maps each element type to its component, handles page breaks
│   ├── chartOptionBuilders.ts  ECharts options per chart type
│   └── elements/               One Vue component per element
├── render-app.ts               Browser entry for the render page
├── theme.ts                    Reads the design tokens from the active theme
├── apply-theme.ts              Injects the theme CSS into the render page
├── types.ts                    Element type definitions
└── data/elementsOneOfEach.ts   Design-preview sample
themes/                         Theme CSS files (default.css, blue.css, …)
ecosystem.config.js             pm2 config
```

### Using the components in your own Vue app

The library build (`dist/`) exports `Elements`, `ChartItem`, `RichText` and the `PdfElement` type:

```js
import { Elements } from 'pdf-creator';
import 'pdf-creator/style.css';
```

`vue` and `echarts` aren't bundled into the library, so your app must install them. For `html` elements, your app also has to provide Tailwind CSS itself.

## Contributing

Issues and pull requests are welcome. Please run `npx tsc --noEmit` and check `/design-preview` before opening a PR.

## License

ISC
