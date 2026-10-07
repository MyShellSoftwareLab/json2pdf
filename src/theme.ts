// =============================================================================
// THEME TOKENS
//
// Los valores NO viven aquí: vienen del tema CSS (themes/default.css + el tema elegido, ver
// services/themes.ts). El servidor inyecta el CSS del tema en la página antes de que cargue
// este módulo (ver apply-theme.ts), y aquí se lee cada token como variable CSS
// (`PRIMARY_500` <-> `--primary-500`). Sin tema en la página (ej. la librería usada desde otra
// app), se usan los valores de themes/default.css empaquetados en el build.
//
// Los nombres exportados no cambian, así que los componentes siguen usando `theme.X` igual
// (v-bind en CSS y constantes en los builders de ECharts).
// =============================================================================
import defaultThemeCss from '../themes/default.css?raw';

const toVar = (name: string) => `--${name.toLowerCase().replace(/_/g, '-')}`;

const parseTokens = (css: string): Record<string, string> => {
    const tokens: Record<string, string> = {};
    for (const match of css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) tokens[match[1]] = match[2].trim();
    return tokens;
};

const DEFAULTS = parseTokens(defaultThemeCss);

// Resuelve `var(--x)` contra los defaults (para el fallback sin tema en la página).
const resolveDefault = (value: string, depth = 0): string =>
    depth > 10 ? value : value.replace(/var\((--[a-z0-9-]+)\)/gi, (_, ref) => resolveDefault(DEFAULTS[ref] ?? '', depth + 1));

const pageStyle = typeof document !== 'undefined' && typeof getComputedStyle === 'function'
    ? getComputedStyle(document.documentElement)
    : null;

/** Valor de un token: el del tema aplicado en la página, o el default. */
export const token = (name: string): string => {
    const cssVar = toVar(name);
    return pageStyle?.getPropertyValue(cssVar).trim() || resolveDefault(DEFAULTS[cssVar] ?? '');
};

const num = (name: string): number => Number(token(name));

// Colores base
export const PRIMARY_50 = token('PRIMARY_50');
export const PRIMARY_100 = token('PRIMARY_100');
export const PRIMARY_200 = token('PRIMARY_200');
export const PRIMARY_300 = token('PRIMARY_300');
export const PRIMARY_400 = token('PRIMARY_400');
export const PRIMARY_500 = token('PRIMARY_500');
export const PRIMARY_600 = token('PRIMARY_600');
export const PRIMARY_700 = token('PRIMARY_700');
export const SECONDARY_50 = token('SECONDARY_50');
export const SECONDARY_100 = token('SECONDARY_100');
export const SECONDARY_200 = token('SECONDARY_200');
export const SECONDARY_300 = token('SECONDARY_300');
export const SECONDARY_400 = token('SECONDARY_400');
export const SECONDARY_500 = token('SECONDARY_500');
export const SECONDARY_600 = token('SECONDARY_600');
export const SECONDARY_700 = token('SECONDARY_700');
export const SECONDARY_800 = token('SECONDARY_800');
export const SECONDARY_900 = token('SECONDARY_900');
export const SURFACE_0 = token('SURFACE_0');
export const SURFACE_50 = token('SURFACE_50');
export const SURFACE_100 = token('SURFACE_100');
export const SURFACE_200 = token('SURFACE_200');
export const SURFACE_300 = token('SURFACE_300');
export const SURFACE_400 = token('SURFACE_400');
export const SURFACE_500 = token('SURFACE_500');
export const SURFACE_600 = token('SURFACE_600');
export const SURFACE_700 = token('SURFACE_700');
export const SURFACE_800 = token('SURFACE_800');
export const SURFACE_900 = token('SURFACE_900');
export const SURFACE_950 = token('SURFACE_950');
export const PRIMARY_DARK = token('PRIMARY_DARK');

// Texto
export const TEXT_PRIMARY = token('TEXT_PRIMARY');
export const TEXT_SECONDARY = token('TEXT_SECONDARY');
export const TEXT_MUTED = token('TEXT_MUTED');

// Espaciado y radios
export const SPACE_1 = token('SPACE_1');
export const SPACE_2 = token('SPACE_2');
export const SPACE_3 = token('SPACE_3');
export const SPACE_4 = token('SPACE_4');
export const SPACE_6 = token('SPACE_6');
export const SPACE_8 = token('SPACE_8');
export const SPACE_10 = token('SPACE_10');
export const RADIUS_SM = token('RADIUS_SM');
export const RADIUS_MD = token('RADIUS_MD');
export const RADIUS_LG = token('RADIUS_LG');
export const RADIUS_XL = token('RADIUS_XL');
export const RADIUS_FULL = token('RADIUS_FULL');

// Tipografía
export const FONT_FAMILY = token('FONT_FAMILY');
export const FONT_SIZE_TITLE = token('FONT_SIZE_TITLE');
export const FONT_SIZE_SUBTITLE = token('FONT_SIZE_SUBTITLE');
export const FONT_SIZE_BODY = token('FONT_SIZE_BODY');
export const LINE_HEIGHT_TITLE = token('LINE_HEIGHT_TITLE');
export const LINE_HEIGHT_SUBTITLE = token('LINE_HEIGHT_SUBTITLE');
export const LINE_HEIGHT_BODY = token('LINE_HEIGHT_BODY');
export const FONT_WEIGHT_REGULAR = num('FONT_WEIGHT_REGULAR');
export const FONT_WEIGHT_MEDIUM = num('FONT_WEIGHT_MEDIUM');
export const FONT_WEIGHT_SEMIBOLD = num('FONT_WEIGHT_SEMIBOLD');
export const FONT_WEIGHT_BOLD = num('FONT_WEIGHT_BOLD');
export const FONT_WEIGHT_EXTRABOLD = num('FONT_WEIGHT_EXTRABOLD');

// Tablas
export const TABLE_HEADER_BG = token('TABLE_HEADER_BG');
export const TABLE_HEADER_TEXT = token('TABLE_HEADER_TEXT');
export const TABLE_BORDER = token('TABLE_BORDER');
export const TABLE_ROW_ALT = token('TABLE_ROW_ALT');

// Secciones
export const SECTION_BG_DEFAULT = token('SECTION_BG_DEFAULT');
export const SECTION_RADIUS = token('SECTION_RADIUS');
export const SECTION_PADDING_Y = token('SECTION_PADDING_Y');
export const SECTION_PADDING_X = token('SECTION_PADDING_X');

// Charts y severidad
export const CHART_TITLE_COLOR = token('CHART_TITLE_COLOR');
export const CHART_TITLE_FONT_SIZE = token('CHART_TITLE_FONT_SIZE');
export const CHART_TITLE_2_FONT_SIZE = token('CHART_TITLE_2_FONT_SIZE');
export const CHART_SUBTITLE_FONT_SIZE = token('CHART_SUBTITLE_FONT_SIZE');
export const CHART_PRIMARY_DARK = token('CHART_PRIMARY_DARK');
export const CHART_ACCENT_GREEN = token('CHART_ACCENT_GREEN');
export const CHART_SECONDARY_CYAN = token('CHART_SECONDARY_CYAN');
export const CHART_LIGHT_BLUE = token('CHART_LIGHT_BLUE');
export const CHART_SUCCESS = token('CHART_SUCCESS');
export const CHART_WARNING = token('CHART_WARNING');
export const CHART_ERROR = token('CHART_ERROR');
export const CHART_PALETTE_1 = token('CHART_PALETTE_1');
export const CHART_PALETTE_2 = token('CHART_PALETTE_2');
export const CHART_PALETTE_3 = token('CHART_PALETTE_3');
export const CHART_PALETTE_4 = token('CHART_PALETTE_4');
export const CHART_PALETTE_5 = token('CHART_PALETTE_5');
export const CHART_PALETTE_6 = token('CHART_PALETTE_6');
export const CHART_PALETTE_7 = token('CHART_PALETTE_7');
export const CHART_PALETTE_8 = token('CHART_PALETTE_8');
export const ACCENT_SUCCESS = token('ACCENT_SUCCESS');
export const ACCENT_ERROR = token('ACCENT_ERROR');
export const ACCENT_WARNING = token('ACCENT_WARNING');
export const RADAR_LABEL_COLOR = token('RADAR_LABEL_COLOR');

// Metric hero
export const HERO_GRADIENT_START = token('HERO_GRADIENT_START');
export const HERO_GRADIENT_END = token('HERO_GRADIENT_END');
export const HERO_MUTED = token('HERO_MUTED');
export const HERO_DANGER = token('HERO_DANGER');

// Heatmap de celda
export const HEATMAP_SUCCESS_BG = token('HEATMAP_SUCCESS_BG');
export const HEATMAP_SUCCESS_TEXT = token('HEATMAP_SUCCESS_TEXT');
export const HEATMAP_WARNING_BG = token('HEATMAP_WARNING_BG');
export const HEATMAP_WARNING_TEXT = token('HEATMAP_WARNING_TEXT');
export const HEATMAP_ERROR_BG = token('HEATMAP_ERROR_BG');
export const HEATMAP_ERROR_TEXT = token('HEATMAP_ERROR_TEXT');
