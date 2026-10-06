import MarkdownIt from 'markdown-it';
import * as fs from 'fs';
import * as path from 'path';

// La documentación pública (GET /) es el propio README.md renderizado — una sola fuente de
// verdad para GitHub y para el sitio.
const README_PATH = path.resolve(__dirname, '../../README.md');
const REPO_URL = 'https://github.com/MyShellSoftwareLab/json2pdf';

// Slug estilo GitHub ("PDF options" -> "pdf-options"), para que los links `#...` del README
// funcionen igual aquí.
const slugify = (text: string): string =>
    text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');

const escapeHtml = (text: string): string =>
    text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

interface TocEntry { level: number; id: string; text: string }

const render = (markdown: string): { html: string; toc: TocEntry[]; title: string } => {
    const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
    const toc: TocEntry[] = [];
    const used = new Map<string, number>();
    let title = 'json2pdf';

    // Ids en los headings + índice (h2/h3) para la barra lateral.
    md.core.ruler.push('heading_ids', (state) => {
        state.tokens.forEach((token, i) => {
            if (token.type !== 'heading_open') return;
            const inline = state.tokens[i + 1];
            const text = inline.children?.filter((t) => t.type === 'text' || t.type === 'code_inline').map((t) => t.content).join('') ?? inline.content;
            const base = slugify(text);
            const count = used.get(base) ?? 0;
            used.set(base, count + 1);
            const id = count === 0 ? base : `${base}-${count}`;
            token.attrSet('id', id);

            const level = Number(token.tag.slice(1));
            if (level === 1) title = text;
            if (level === 2 || level === 3) toc.push({ level, id, text });
        });
    });

    return { html: md.render(markdown), toc, title };
};

export const renderDocsPage = (): string => {
    const { html, toc, title } = render(fs.readFileSync(README_PATH, 'utf8'));
    const nav = toc
        .map((e) => `<a class="toc__link toc__link--h${e.level}" href="#${e.id}">${escapeHtml(e.text)}</a>`)
        .join('');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — JSON to PDF API</title>
<meta name="description" content="Turn a JSON array of report elements into a print-ready PDF. Charts, tables, Tailwind HTML, page options. Open source and self-hostable.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #ffffff; --bg-soft: #f8fafc; --bg-code: #0f172a; --text: #0f172a; --muted: #64748b;
  --border: #e2e8f0; --accent: #2563eb; --accent-soft: #eff6ff; --code-text: #e2e8f0; --inline-code: #f1f5f9;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0b1120; --bg-soft: #111827; --bg-code: #020617; --text: #e5e7eb; --muted: #94a3b8;
    --border: #1f2937; --accent: #60a5fa; --accent-soft: #172554; --code-text: #e2e8f0; --inline-code: #1e293b;
  }
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 76px; }
body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.65 Inter, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.topbar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 16px; height: 60px; padding: 0 24px;
  background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); }
.topbar__brand { font-weight: 700; font-size: 18px; color: var(--text); letter-spacing: -0.01em; }
.topbar__brand span { color: var(--accent); }
.topbar__links { margin-left: auto; display: flex; gap: 8px; }
.topbar__links a { padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; color: var(--text); }
.topbar__links a:hover { background: var(--bg-soft); text-decoration: none; }
.topbar__links a.primary { background: var(--accent); color: #fff; }

.layout { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: 48px; max-width: 1180px; margin: 0 auto; padding: 0 24px; }
.toc { position: sticky; top: 60px; align-self: start; max-height: calc(100vh - 60px); overflow-y: auto; padding: 28px 0; }
.toc__link { display: block; padding: 4px 10px; border-radius: 6px; color: var(--muted); font-size: 14px; }
.toc__link:hover { color: var(--text); background: var(--bg-soft); text-decoration: none; }
.toc__link--h2 { color: var(--text); font-weight: 600; margin-top: 10px; }
.toc__link--h3 { padding-left: 22px; }

.content { min-width: 0; padding: 28px 0 96px; }
.content h1 { font-size: 44px; line-height: 1.1; letter-spacing: -0.03em; margin: 12px 0 16px; }
.content h2 { font-size: 28px; letter-spacing: -0.02em; margin: 56px 0 12px; padding-top: 8px; }
.content h3 { font-size: 20px; margin: 36px 0 8px; }
.content h4 { font-size: 16px; margin: 28px 0 8px; }
.content h1 + p { font-size: 19px; color: var(--muted); }
.content hr { border: 0; border-top: 1px solid var(--border); margin: 48px 0; }
.content code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.86em; background: var(--inline-code); padding: 2px 6px; border-radius: 6px; }
.content pre { background: var(--bg-code); color: var(--code-text); padding: 18px 20px; border-radius: 12px; overflow-x: auto; font-size: 14px; line-height: 1.6; }
.content pre code { background: none; padding: 0; font-size: inherit; color: inherit; }
.content table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; display: block; overflow-x: auto; }
.content th, .content td { border-bottom: 1px solid var(--border); padding: 10px 12px; text-align: left; vertical-align: top; }
.content th { background: var(--bg-soft); font-weight: 600; white-space: nowrap; }
.content blockquote { margin: 16px 0; padding: 8px 16px; border-left: 4px solid var(--accent); background: var(--accent-soft); border-radius: 0 8px 8px 0; }
.content ul, .content ol { padding-left: 24px; }
.content li + li { margin-top: 4px; }

@media (max-width: 860px) {
  .layout { grid-template-columns: 1fr; gap: 0; padding: 0 16px; }
  .toc { display: none; }
  .topbar { padding: 0 16px; }
  .topbar__links a:not(.primary) { display: none; }
  .content h1 { font-size: 34px; }
}
</style>
</head>
<body>
<header class="topbar">
  <a class="topbar__brand" href="/">json<span>2</span>pdf</a>
  <nav class="topbar__links">
    <a href="#using-the-api">API</a>
    <a href="#self-hosting">Self-hosting</a>
    <a href="${REPO_URL}">GitHub</a>
    <a class="primary" href="/design-preview" target="_blank" rel="noopener">Live preview</a>
  </nav>
</header>
<div class="layout">
  <aside class="toc">${nav}</aside>
  <main class="content">${html}</main>
</div>
</body>
</html>`;
};
