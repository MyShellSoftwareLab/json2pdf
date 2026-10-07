import puppeteer from 'puppeteer';
import * as path from 'path';
import { PdfElement } from '../types';
import { buildTailwindCss } from './tailwind';
import { resolvePdfOptions, ResolvedPdfOptions } from './pdfOptions';
import { loadThemeCss } from './themes';

export const generatePdf = async (elements: PdfElement[], options?: ResolvedPdfOptions): Promise<Buffer> => {
    const appPath = path.resolve(__dirname, '../../dist-app/index.html');
    const tailwindCss = await buildTailwindCss(elements);
    const { pdf: pdfOptions, viewport, title, theme } = options ?? resolvePdfOptions(undefined).options;
    const themeCss = loadThemeCss(theme);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files', '--enable-local-file-accesses'],
        headless: true,
    });

    try {
        const page = await browser.newPage();

        // Viewport = área imprimible de la hoja (página - márgenes, / scale; ver pdfOptions.ts).
        // Sin esto Puppeteer renderiza a 800x600: los charts (ECharts mide su contenedor al
        // montarse) y el `100vh` de la portada no corresponderían a la hoja real.
        await page.setViewport(viewport);

        // Inject data before the page loads
        await page.evaluateOnNewDocument((data, css, docTitle, themeStyles) => {
            // @ts-ignore
            window.__PDF_ELEMENTS__ = data;
            // @ts-ignore
            window.__PDF_TAILWIND_CSS__ = css;
            // @ts-ignore
            window.__PDF_TITLE__ = docTitle;
            // @ts-ignore — lo aplica apply-theme.ts antes de que cargue theme.ts
            window.__PDF_THEME_CSS__ = themeStyles;
        }, elements as any, tailwindCss, title ?? null, themeCss); // Cast to any to pass serializable data

        await page.goto(`file://${appPath}`, { waitUntil: 'networkidle0' });

        // Wait for the render complete signal
        await page.waitForFunction('window.RENDER_COMPLETE === true', { timeout: 10000 });

        const pdf = await page.pdf(pdfOptions);

        return Buffer.from(pdf);
    } finally {
        // Siempre cerrar Chromium, también si el render falla (si no, queda el proceso vivo).
        await browser.close();
    }
};
