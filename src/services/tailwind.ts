import { compile } from '@tailwindcss/node';
import * as fs from 'fs';
import * as path from 'path';
import { PdfElement } from '../types';

// Raíz del proyecto (donde vive node_modules/tailwindcss) — desde src/services o dist/services.
const ROOT = path.resolve(__dirname, '../..');

// Preflight leído una sola vez; se inlinea dentro del @scope para que el reset solo afecte el
// contenido de los elementos `html` y no al resto del reporte.
let preflightCss: string | null = null;
const getPreflight = (): string => {
    if (preflightCss === null) {
        preflightCss = fs.readFileSync(require.resolve('tailwindcss/preflight.css', { paths: [ROOT] }), 'utf8');
    }

    return preflightCss;
};

// Clases de todos los atributos `class="..."` / `class='...'` del HTML. Tailwind descarta solas
// las que no son utilidades válidas.
const CLASS_ATTR = /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

export const extractCandidates = (html: string): string[] => {
    const candidates = new Set<string>();
    for (const match of html.matchAll(CLASS_ATTR)) {
        (match[1] ?? match[2] ?? '').split(/\s+/).filter(Boolean).forEach((c) => candidates.add(c));
    }

    return [...candidates];
};

/**
 * Compila (Tailwind v4) solo las utilidades usadas por los elementos `html` del reporte.
 * Preflight y utilidades quedan dentro de `@scope (.el-html)` (ver HtmlContent.vue), así que
 * nunca pisan los estilos de los demás elementos. Devuelve '' si no hay elementos `html`.
 */
export const buildTailwindCss = async (elements: PdfElement[]): Promise<string> => {
    const html = elements
        .filter((el) => el?.type === 'html' && typeof el.content === 'string')
        .map((el) => el.content as string)
        .join('\n');

    if (!html) return '';

    const input = `
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@layer base { @scope (.el-html) { ${getPreflight()} } }
@layer utilities { @scope (.el-html) { @tailwind utilities; } }
`;

    // Un compilador nuevo por reporte: `build()` acumula candidatos entre llamadas.
    const compiler = await compile(input, { base: ROOT, onDependency: () => {} });

    return compiler.build(extractCandidates(html));
};
