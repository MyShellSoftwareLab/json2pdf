import express = require('express');
import bodyParser = require('body-parser');
import morgan = require('morgan');
import { generatePdf } from './services/pdfGenerator';
import { PdfElement } from './types';
import { validateElements } from './services/validator';
import { buildTailwindCss } from './services/tailwind';
import { resolvePdfOptions, ResolvedPdfOptions } from './services/pdfOptions';
import { elementsOneOfEach } from './data/elementsOneOfEach';
import { renderDocsPage } from './services/docs';
import { listThemes, loadThemeCss } from './services/themes';
import * as fs from 'fs';
import * as path from 'path';

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '50mb' }));

// Assets de la app de render (los usa /design-preview-html). `index: false` para que `/` no
// sirva esa app interna sino la documentación.
app.use(express.static(path.join(__dirname, '../dist-app'), { index: false }));

// Documentación pública: README.md renderizado.
app.get('/', (req, res) => {
  try {
    res.type('html').send(renderDocsPage());
  } catch (error) {
    console.error('Error rendering docs:', error);
    res.status(500).send('Error rendering docs');
  }
});

const sendPdf = (res: express.Response, pdfBuffer: Buffer, options: ResolvedPdfOptions) => {
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `${options.disposition}; filename="${options.filename}"`,
    'Content-Length': pdfBuffer.length,
  });
  res.send(pdfBuffer);
};

// Query string de /design-preview -> mismas `options` que acepta POST /api/generate-pdf
// (ej. ?format=Letter&landscape=true&margin=1in&pageNumbers=true).
const optionsFromQuery = (query: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = { disposition: 'inline', filename: 'design-preview' };
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== 'string') continue;
    if (value === 'true' || value === 'false') out[key] = value === 'true';
    else if (key === 'scale') out[key] = Number(value);
    else out[key] = value;
  }
  return out;
};

// Temas disponibles (archivos en /themes) — los valores válidos de `options.theme`.
app.get('/api/themes', (req, res) => {
  res.json({ themes: listThemes() });
});

app.post('/api/generate-pdf', async (req, res) => {
  try {
    const elements: PdfElement[] = req.body?.elements;

    if (!elements || !Array.isArray(elements)) {
      res.status(400).send('Invalid input: Expected an object with an "elements" array.');
      return;
    }

    const validation = validateElements(elements);
    const { errors: optionErrors, options } = resolvePdfOptions(req.body?.options);
    if (optionErrors.length > 0) {
      validation.isValid = false;
      validation.errors.push({ errors: optionErrors.map((e) => `options: ${e}`), element: req.body.options });
    }

    if (!validation.isValid) {
      console.log('Validation Failed:', JSON.stringify(validation.errors, null, 2));
      res.status(400).json({ error: 'Validation Failed', details: validation.errors });
      return;
    }

    sendPdf(res, await generatePdf(elements, options), options);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
});


app.get('/design-preview', async (req, res) => {
  try {
    const { errors, options } = resolvePdfOptions(optionsFromQuery(req.query as Record<string, unknown>));
    if (errors.length > 0) {
      res.status(400).json({ error: 'Invalid options', details: errors });
      return;
    }

    sendPdf(res, await generatePdf(elementsOneOfEach, options), options);
  } catch (error) {
    console.error('Error generating design preview:', error);
    res.status(500).send('Error generating preview: ' + (error instanceof Error ? error.message : String(error)));
  }
});

app.get('/design-preview-html', async (req, res) => {
  try {
    const appPath = path.resolve(__dirname, '../dist-app/index.html');
    if (!fs.existsSync(appPath)) {
      res.status(404).send('App not built. Run "npm run build:app" first.');
      return;
    }

    // Mismas opciones por query que /design-preview; aquí solo aplican `theme` y `title`.
    const { errors, options } = resolvePdfOptions(optionsFromQuery(req.query as Record<string, unknown>));
    if (errors.length > 0) {
      res.status(400).json({ error: 'Invalid options', details: errors });
      return;
    }

    let html = fs.readFileSync(appPath, 'utf-8');
    const tailwindCss = await buildTailwindCss(elementsOneOfEach);
    const themeCss = loadThemeCss(options.theme);
    // `<` escapado para que ningún "</script>" dentro de los datos cierre el tag antes de tiempo.
    const toScriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
    const dataScript = `<script>window.__PDF_ELEMENTS__ = ${toScriptJson(elementsOneOfEach)};window.__PDF_TAILWIND_CSS__ = ${toScriptJson(tailwindCss)};window.__PDF_THEME_CSS__ = ${toScriptJson(themeCss)};window.__PDF_TITLE__ = ${toScriptJson(options.title ?? null)};</script>`;

    // Inject data before the closing head tag or at the beginning of body
    html = html.replace('</head>', `${dataScript}</head>`);

    res.send(html);
  } catch (error) {
    console.error('Error generating HTML preview:', error);
    res.status(500).send('Error generating HTML preview: ' + (error instanceof Error ? error.message : String(error)));
  }
});

export default app;
