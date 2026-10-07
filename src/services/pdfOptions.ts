import type { PDFOptions } from 'puppeteer';
import { DEFAULT_THEME, isValidTheme, listThemes } from './themes';

// =============================================================================
// Opciones de impresión del PDF (`options` en el payload de POST /api/generate-pdf).
// Todo es opcional: sin `options` el resultado es el de siempre (A4 vertical, márgenes 20px).
// =============================================================================

export type PageFormat =
    | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6'
    | 'Letter' | 'Legal' | 'Tabloid' | 'Ledger';

export interface PageNumbersOptions {
    // Texto con {page} y {total}, ej. "Página {page} de {total}". Default "Page {page} of {total}".
    format?: string;
    align?: 'left' | 'center' | 'right';
    position?: 'header' | 'footer';
}

export interface PdfRenderOptions {
    format?: PageFormat | string;
    // Tamaño personalizado (ej. "210mm", "8.5in", 800). Si se pasa, reemplaza a `format`.
    width?: string | number;
    height?: string | number;
    landscape?: boolean;
    // Un valor para los 4 lados, o por lado.
    margin?: string | number | { top?: string | number; right?: string | number; bottom?: string | number; left?: string | number };
    scale?: number;
    printBackground?: boolean;
    pageRanges?: string;
    pageNumbers?: boolean | PageNumbersOptions;
    headerTemplate?: string;
    footerTemplate?: string;
    title?: string;
    // Nombre de un tema en /themes (ej. "blue"). Default "default".
    theme?: string;
    outline?: boolean;
    filename?: string;
    disposition?: 'attachment' | 'inline';
}

export interface ResolvedPdfOptions {
    pdf: PDFOptions;
    // Área imprimible (página - márgenes) / scale, en px CSS — el viewport con el que se
    // renderiza el HTML, para que charts y `100vh` (portada) correspondan a la hoja real.
    viewport: { width: number; height: number };
    title?: string;
    theme: string;
    filename: string;
    disposition: 'attachment' | 'inline';
}

// Tamaños en pulgadas (ancho x alto, vertical) — mismos que usa Chrome/Puppeteer.
const FORMATS: Record<string, { name: PageFormat; width: number; height: number }> = {
    a0: { name: 'A0', width: 33.1102, height: 46.811 },
    a1: { name: 'A1', width: 23.3858, height: 33.1102 },
    a2: { name: 'A2', width: 16.5354, height: 23.3858 },
    a3: { name: 'A3', width: 11.6929, height: 16.5354 },
    a4: { name: 'A4', width: 8.2677, height: 11.6929 },
    a5: { name: 'A5', width: 5.8268, height: 8.2677 },
    a6: { name: 'A6', width: 4.1339, height: 5.8268 },
    letter: { name: 'Letter', width: 8.5, height: 11 },
    legal: { name: 'Legal', width: 8.5, height: 14 },
    tabloid: { name: 'Tabloid', width: 11, height: 17 },
    ledger: { name: 'Ledger', width: 17, height: 11 },
};

const PX_PER_UNIT: Record<string, number> = { px: 1, in: 96, cm: 96 / 2.54, mm: 96 / 25.4 };
const LENGTH = /^(\d+(?:\.\d+)?)\s*(px|in|cm|mm)?$/i;

const DEFAULT_MARGIN = '20px';
// Margen mínimo cuando hay header/footer y el usuario no fijó ese lado — si no, el texto
// del header/footer queda pegado al borde o encima del contenido.
const HEADER_FOOTER_MARGIN = '48px';

const toPx = (value: string | number): number | null => {
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
    const match = String(value).trim().match(LENGTH);
    if (!match) return null;

    return parseFloat(match[1]) * PX_PER_UNIT[(match[2] ?? 'px').toLowerCase()];
};

const escapeHtml = (text: string): string =>
    text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const pageNumbersTemplate = (opts: PageNumbersOptions): string => {
    const text = escapeHtml(opts.format ?? 'Page {page} of {total}')
        .replace(/\{page\}/g, '<span class="pageNumber"></span>')
        .replace(/\{total\}/g, '<span class="totalPages"></span>');

    return `<div style="width:100%;padding:0 20px;font-size:9px;font-family:Helvetica,Arial,sans-serif;color:#6b7280;text-align:${opts.align ?? 'center'};">${text}</div>`;
};

/**
 * Valida y normaliza `options`. Devuelve los errores (para responder 400) o las opciones
 * resueltas listas para Puppeteer.
 */
export const resolvePdfOptions = (raw: unknown): { errors: string[]; options: ResolvedPdfOptions } => {
    const errors: string[] = [];
    const o = (raw ?? {}) as PdfRenderOptions;

    if (raw !== undefined && (typeof raw !== 'object' || raw === null || Array.isArray(raw))) {
        errors.push("'options' must be an object.");
    }

    // ---- Tamaño de página -------------------------------------------------------------
    let pageWidthPx: number | null = null;
    let pageHeightPx: number | null = null;
    let format: PageFormat | undefined;

    if (o.width !== undefined || o.height !== undefined) {
        pageWidthPx = o.width !== undefined ? toPx(o.width) : null;
        pageHeightPx = o.height !== undefined ? toPx(o.height) : null;
        if (pageWidthPx === null || pageHeightPx === null || pageWidthPx <= 0 || pageHeightPx <= 0) {
            errors.push("'width' and 'height' must both be set to a length like \"210mm\", \"8.5in\", \"21cm\" or a number of px.");
        }
    } else {
        const def = FORMATS[String(o.format ?? 'A4').toLowerCase()];
        if (!def) {
            errors.push(`'format' must be one of: ${Object.values(FORMATS).map((f) => f.name).join(', ')}.`);
        } else {
            format = def.name;
            pageWidthPx = def.width * 96;
            pageHeightPx = def.height * 96;
        }
    }

    if (o.landscape !== undefined && typeof o.landscape !== 'boolean') errors.push("'landscape' must be a boolean.");
    const landscape = o.landscape === true;

    // ---- Header / footer --------------------------------------------------------------
    let headerTemplate = o.headerTemplate;
    let footerTemplate = o.footerTemplate;
    if (headerTemplate !== undefined && typeof headerTemplate !== 'string') errors.push("'headerTemplate' must be an HTML string.");
    if (footerTemplate !== undefined && typeof footerTemplate !== 'string') errors.push("'footerTemplate' must be an HTML string.");

    if (o.pageNumbers !== undefined && o.pageNumbers !== false) {
        const pn: PageNumbersOptions = o.pageNumbers === true ? {} : (o.pageNumbers as PageNumbersOptions);
        if (typeof pn !== 'object' || pn === null) {
            errors.push("'pageNumbers' must be true or an object { format, align, position }.");
        } else {
            if (pn.format !== undefined && typeof pn.format !== 'string') errors.push("'pageNumbers.format' must be a string.");
            if (pn.align !== undefined && !['left', 'center', 'right'].includes(pn.align)) errors.push("'pageNumbers.align' must be 'left', 'center' or 'right'.");
            if (pn.position !== undefined && !['header', 'footer'].includes(pn.position)) errors.push("'pageNumbers.position' must be 'header' or 'footer'.");
            // Un template explícito tiene prioridad sobre el número de página en ese lado.
            if (pn.position === 'header') headerTemplate = headerTemplate ?? pageNumbersTemplate(pn);
            else footerTemplate = footerTemplate ?? pageNumbersTemplate(pn);
        }
    }

    const displayHeaderFooter = headerTemplate !== undefined || footerTemplate !== undefined;

    // ---- Márgenes ---------------------------------------------------------------------
    const sides = ['top', 'right', 'bottom', 'left'] as const;
    const given: Partial<Record<(typeof sides)[number], string | number>> =
        typeof o.margin === 'object' && o.margin !== null ? o.margin : o.margin !== undefined ? { top: o.margin, right: o.margin, bottom: o.margin, left: o.margin } : {};

    const margin = {} as Record<(typeof sides)[number], string>;
    const marginPx = {} as Record<(typeof sides)[number], number>;
    for (const side of sides) {
        let value = given[side];
        if (value === undefined) {
            value = (side === 'top' && headerTemplate !== undefined) || (side === 'bottom' && footerTemplate !== undefined) ? HEADER_FOOTER_MARGIN : DEFAULT_MARGIN;
        }
        const px = toPx(value);
        if (px === null) {
            errors.push(`'margin${o.margin !== undefined && typeof o.margin === 'object' ? '.' + side : ''}' must be a length like "20px", "1cm", "10mm", "0.5in" or a number of px.`);
            continue;
        }
        margin[side] = typeof value === 'number' ? `${value}px` : String(value).trim();
        marginPx[side] = px;
    }

    // ---- Resto ------------------------------------------------------------------------
    const scale = o.scale ?? 1;
    if (typeof scale !== 'number' || scale < 0.1 || scale > 2) errors.push("'scale' must be a number between 0.1 and 2.");

    if (o.printBackground !== undefined && typeof o.printBackground !== 'boolean') errors.push("'printBackground' must be a boolean.");
    if (o.outline !== undefined && typeof o.outline !== 'boolean') errors.push("'outline' must be a boolean.");
    if (o.pageRanges !== undefined && (typeof o.pageRanges !== 'string' || !/^\s*\d+(\s*-\s*\d+)?(\s*,\s*\d+(\s*-\s*\d+)?)*\s*$/.test(o.pageRanges))) {
        errors.push("'pageRanges' must look like \"1-3, 5\".");
    }
    if (o.title !== undefined && typeof o.title !== 'string') errors.push("'title' must be a string.");
    if (o.theme !== undefined && (typeof o.theme !== 'string' || !isValidTheme(o.theme))) {
        errors.push(`'theme' must be one of: ${listThemes().join(', ')}.`);
    }
    if (o.disposition !== undefined && !['attachment', 'inline'].includes(o.disposition)) errors.push("'disposition' must be 'attachment' or 'inline'.");
    if (o.filename !== undefined && typeof o.filename !== 'string') errors.push("'filename' must be a string.");

    // Solo caracteres seguros para el header Content-Disposition.
    const base = (typeof o.filename === 'string' ? o.filename : 'report').replace(/\.pdf$/i, '').replace(/[^\w.\- ]+/g, '').trim() || 'report';

    // ---- Viewport = área imprimible / scale ------------------------------------------
    const pageW = (landscape ? pageHeightPx : pageWidthPx) ?? 0;
    const pageH = (landscape ? pageWidthPx : pageHeightPx) ?? 0;
    const safeScale = typeof scale === 'number' && scale >= 0.1 ? scale : 1;
    const viewport = {
        width: Math.round((pageW - (marginPx.left ?? 0) - (marginPx.right ?? 0)) / safeScale),
        height: Math.round((pageH - (marginPx.top ?? 0) - (marginPx.bottom ?? 0)) / safeScale),
    };
    if (errors.length === 0 && (viewport.width < 100 || viewport.height < 100)) {
        errors.push('The margins leave less than 100px of printable area; reduce them or use a larger page.');
    }

    const pdf: PDFOptions = {
        printBackground: o.printBackground ?? true,
        landscape,
        margin,
        scale: safeScale,
        displayHeaderFooter,
        // Chrome pone un header/footer por defecto (fecha, URL) si uno de los dos falta.
        headerTemplate: displayHeaderFooter ? headerTemplate ?? '<span></span>' : undefined,
        footerTemplate: displayHeaderFooter ? footerTemplate ?? '<span></span>' : undefined,
        pageRanges: o.pageRanges,
        outline: o.outline === true,
        tagged: o.outline === true ? true : undefined,
    };
    if (format) pdf.format = format;
    else {
        pdf.width = typeof o.width === 'number' ? `${o.width}px` : String(o.width).trim();
        pdf.height = typeof o.height === 'number' ? `${o.height}px` : String(o.height).trim();
    }

    return {
        errors: [...new Set(errors)], // un margen inválido para los 4 lados se reporta una vez
        options: {
            pdf,
            viewport,
            title: typeof o.title === 'string' ? o.title : undefined,
            theme: typeof o.theme === 'string' && isValidTheme(o.theme) ? o.theme : DEFAULT_THEME,
            filename: `${base}.pdf`,
            disposition: o.disposition ?? 'attachment',
        },
    };
};
