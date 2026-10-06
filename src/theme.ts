// =============================================================================
// THEME TOKENS — neutral default palette (Tailwind blue / slate / gray). Swap these
// values to re-brand every element of the report.
// =============================================================================
// Primary colors (Tailwind blue) -> Title color / acentos
export const PRIMARY_50 = "#EFF6FF";
export const PRIMARY_100 = "#DBEAFE";
export const PRIMARY_200 = "#BFDBFE";
export const PRIMARY_300 = "#93C5FD";
export const PRIMARY_400 = "#60A5FA";
export const PRIMARY_500 = "#3B82F6"; // main accent
export const PRIMARY_600 = "#2563EB"; // hover
export const PRIMARY_700 = "#1D4ED8"; // active


// Secondary colors (Tailwind slate, dark-weighted) -> Subtitle color
export const SECONDARY_50 = "#F8FAFC";
export const SECONDARY_100 = "#F1F5F9";
export const SECONDARY_200 = "#E2E8F0";
export const SECONDARY_300 = "#94A3B8"; // slate-400
export const SECONDARY_400 = "#64748B"; // slate-500
export const SECONDARY_500 = "#334155"; // slate-700 (main)
export const SECONDARY_600 = "#1E293B"; // slate-800
export const SECONDARY_700 = "#172033";
export const SECONDARY_800 = "#0F172A"; // slate-900
export const SECONDARY_900 = "#020617"; // slate-950


// Surface colors (Tailwind gray) -> fondos, bordes y texto neutro
export const SURFACE_0 = "#ffffff";
export const SURFACE_50 = "#F9FAFB";
export const SURFACE_100 = "#F3F4F6";
export const SURFACE_200 = "#E5E7EB";
export const SURFACE_300 = "#9CA3AF";
export const SURFACE_400 = "#6B7280";
export const SURFACE_500 = "#64748B";
export const SURFACE_600 = "#4B5563";
export const SURFACE_700 = "#374151";
export const SURFACE_800 = "#1F2937";
export const SURFACE_900 = "#111827";
export const SURFACE_950 = "#030712";


// =============================================================================
// SEMANTIC COLOR ALIASES
// =============================================================================
export const PRIMARY_DARK = PRIMARY_700;

// Text colors
export const TEXT_PRIMARY = SURFACE_950;     // paragraph
export const TEXT_SECONDARY = SECONDARY_700;   // subtitles/headings
export const TEXT_MUTED = SURFACE_600;

// Spacing scale (4px base)
export const SPACE_1 = "4px";
export const SPACE_2 = "8px";
export const SPACE_3 = "12px";
export const SPACE_4 = "16px";
export const SPACE_6 = "24px";
export const SPACE_8 = "32px";
export const SPACE_10 = "40px";

// Radius scale
export const RADIUS_SM = "8px";
export const RADIUS_MD = "12px";
export const RADIUS_LG = "14px";
export const RADIUS_XL = "18px";
export const RADIUS_FULL = "9999px";

// =============================================================================
// TYPOGRAPHY (REPORT-like hierarchy)
// =============================================================================

export const FONT_FAMILY = "'Inter', 'Helvetica', 'Arial', sans-serif";
// Más parecido a la portada del ejemplo
// Ajuste de tipografía
export const FONT_SIZE_TITLE = "28px";
export const FONT_SIZE_SUBTITLE = "22px";
export const FONT_SIZE_BODY = "16px";

export const LINE_HEIGHT_TITLE = "1.1";
export const LINE_HEIGHT_SUBTITLE = "1.2";
export const LINE_HEIGHT_BODY = "1.4";

export const FONT_WEIGHT_REGULAR = 400;
export const FONT_WEIGHT_MEDIUM = 500;
export const FONT_WEIGHT_SEMIBOLD = 600;
export const FONT_WEIGHT_BOLD = 700;
export const FONT_WEIGHT_EXTRABOLD = 800;

// =============================================================================
// TABLE TOKENS (clean, airy)
// =============================================================================
export const TABLE_HEADER_BG = SURFACE_100;
export const TABLE_HEADER_TEXT = SURFACE_700;
export const TABLE_BORDER = SURFACE_200;
export const TABLE_ROW_ALT = SURFACE_50;

// =============================================================================
// SECTION / CARD DEFAULTS (for light-blue panels like REPORT)
// =============================================================================

export const SECTION_BG_DEFAULT = PRIMARY_50;
export const SECTION_RADIUS = "48px";
export const SECTION_PADDING_Y = "48px";
export const SECTION_PADDING_X = "48px";

// =============================================================================
// CHART'S SECTION
// =============================================================================

// Chart title color
export const CHART_TITLE_COLOR = SECONDARY_600;

// CHART STYLES

export const CHART_TITLE_FONT_SIZE = "30px";
export const CHART_TITLE_2_FONT_SIZE = "26px";
export const CHART_SUBTITLE_FONT_SIZE = "24px";

export const CHART_PRIMARY_DARK = SECONDARY_600;
export const CHART_ACCENT_GREEN = "#10B981";
export const CHART_SECONDARY_CYAN = PRIMARY_200;
export const CHART_LIGHT_BLUE = PRIMARY_600;

// Semáforo de severidad (Tailwind emerald/amber/rose).
export const CHART_SUCCESS = "#10B981";
export const CHART_WARNING = "#F59E0B";
export const CHART_ERROR = "#F43F5E";

// Accent colors for status/feedback
export const ACCENT_SUCCESS = CHART_SUCCESS;
export const ACCENT_ERROR = CHART_ERROR;
export const ACCENT_WARNING = CHART_WARNING;


// Radar specific helpers
export const RADAR_LABEL_COLOR = PRIMARY_600;

// =============================================================================
// METRIC HERO — tarjeta oscura de la variante "hero" de `metric` (ver Metric.vue).
// =============================================================================
export const HERO_GRADIENT_START = SECONDARY_800;
export const HERO_GRADIENT_END = PRIMARY_700;
export const HERO_MUTED = "#94A3B8"; // slate-400 — labels pequeños
export const HERO_DANGER = "#FB7185"; // rose-400 — valores en riesgo

// =============================================================================
// HEATMAP DE CELDA (tabla de departamentos) — a diferencia de la píldora de severidad
// (ACCENT_SUCCESS/WARNING/ERROR, fondo saturado + texto blanco), esto es fondo claro +
// texto oscuro del mismo tono, pensado para pintar la celda COMPLETA sin que se vea pesado
// en una tabla con muchas columnas.
// =============================================================================
export const HEATMAP_SUCCESS_BG = "#D1FAE5"; // emerald-100
export const HEATMAP_SUCCESS_TEXT = "#047857"; // emerald-700
export const HEATMAP_WARNING_BG = "#FEF3C7"; // amber-100
export const HEATMAP_WARNING_TEXT = "#B45309"; // amber-700
export const HEATMAP_ERROR_BG = "#FFE4E6"; // rose-100
export const HEATMAP_ERROR_TEXT = "#BE123C"; // rose-700
