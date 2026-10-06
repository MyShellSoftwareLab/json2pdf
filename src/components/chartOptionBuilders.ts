import * as echarts from 'echarts';
import * as theme from '../theme';
import { PdfElement } from "../types";
import type { BarSeriesOption } from 'echarts';
import { DIMENSION_ICONS, dimensionIconDataUri, DEPARTMENT_ICONS, departmentIconDataUri } from '../icons';

// Umbrales de severidad por score (>=70 success, >=55 warning, resto error), compartidos por
// el resto del reporte (radar, tablas, score general) — un solo criterio para todo el PDF.
const severityColor = (value: number): string => {
    if (value >= 70) return theme.CHART_SUCCESS;
    if (value >= 55) return theme.CHART_WARNING;

    return theme.CHART_ERROR;
};

export const DEFAULT_CHART_COLORS = [
    theme.CHART_PRIMARY_DARK,
    theme.CHART_ACCENT_GREEN,
    theme.CHART_SECONDARY_CYAN,
    theme.CHART_LIGHT_BLUE,
    theme.CHART_WARNING,
    theme.CHART_ERROR,

    // +2 para completar 8 (cuando hay <= 8 items)
    theme.PRIMARY_400,      // cyan fuerte (marca)
    theme.SECONDARY_300,    // azul gris medio (diferente al resto)
].filter(Boolean) as string[];

export const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type Opt = echarts.EChartsOption;
type Builder = (el: PdfElement) => Opt | null;

const buildBarChart: Builder = (element) => {
    const barElement = element as any;

    // Filter out items with value 0
    const filteredData = barElement.data.filter((d: any) => d.value !== 0);

    return {
        tooltip: { show: false },
        xAxis: {
            type: 'category',
            data: filteredData.map((d: any) => d.label),
            axisTick: { show: false },
            axisLabel: {
                color: theme.SECONDARY_600,
                fontStyle: 'italic',
                fontSize: 14,
                fontWeight: 400,
                interval: 0, // Force show all labels
                hideOverlap: false,
            },
            axisLine: { lineStyle: { color: hexToRgba(theme.SECONDARY_600, 0.20) } },
        },
        yAxis: {
            type: 'value',
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: { lineStyle: { color: hexToRgba(theme.PRIMARY_500, 0.35), type: 'dashed' } },
            axisLabel: {
                color: theme.SECONDARY_600,
                fontSize: 16,
                fontWeight: 400,
            },
        },
        series: [
            {
                type: 'bar',
                data: filteredData.map((d: any) => d.value),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: hexToRgba(theme.SECONDARY_500, 1) },
                        { offset: 0.9, color: hexToRgba(theme.SECONDARY_800, 1) },
                    ]),
                },
            },
        ],
    };
};

const buildHorizontalBar: Builder = (element) => {
    const hBarElement = element as any;

    type Row = { label: unknown; value: number }

    const rows: Row[] = Array.isArray(hBarElement.data)
        ? hBarElement.data.map((d: any) => ({ label: d.label, value: Number(d.value ?? 0) }))
        : (Array.isArray(hBarElement.labels) ? hBarElement.labels : []).map((l: any, i: number) => ({
            label: l,
            value: Number((hBarElement.values ?? [])[i] ?? 0),
        }))

    const labels = rows.map((r: Row) => String(r.label));
    const values = rows.map((r: Row) => r.value);

    if (hBarElement.variant === 'severity_list') {
        return buildSeverityListBar(hBarElement, labels, values);
    }

    return {
        tooltip: { show: false },
        grid: { left: 28, right: 26, top: 18, bottom: 34, containLabel: true },

        xAxis: {
            type: 'value',
            min: 0,
            max: 100,
            interval: 20,
            axisTick: { show: false },
            axisLine: { lineStyle: { color: hexToRgba(theme.SECONDARY_600, 0.45), width: 2 } },
            axisLabel: {
                color: theme.SECONDARY_700,
                fontFamily: theme.FONT_FAMILY,
                fontSize: 22,
                fontWeight: 500,
                margin: 16,
            },
            splitLine: {
                show: true,
                lineStyle: { color: hexToRgba(theme.PRIMARY_500, 0.4), type: 'dashed', width: 2 },
            },
        },

        yAxis: {
            type: 'category',
            data: labels,
            inverse: true,
            axisTick: { show: false },
            axisLabel: { show: false },
            axisLine: { show: true, lineStyle: { color: hexToRgba(theme.SECONDARY_600, 0.45), width: 2 } },
        },

        series: [
            // Series 1 – labels INSIDE the bar (white) for long bars
            {
                type: 'bar',
                data: values,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: hexToRgba(theme.SECONDARY_500, 1) },
                        { offset: 0.9, color: hexToRgba(theme.SECONDARY_800, 1) },
                    ]),
                },
                label: {
                    show: true,
                    position: 'insideLeft',
                    distance: 26,
                    color: '#FFFFFF',
                    fontFamily: theme.FONT_FAMILY,
                    fontSize: 20,
                    fontWeight: 500,
                    formatter: (p: any) => {
                        const v = values[p.dataIndex];
                        return v > 20 ? `${labels[p.dataIndex]} (${v})` : '';
                    },
                },
            },
            // Series 2 – labels OUTSIDE the bar (dark) for short bars
            {
                type: 'bar',
                data: values.map((v: number) => (v <= 20 ? v : 0)),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: hexToRgba(theme.SECONDARY_500, 1) },
                        { offset: 0.9, color: hexToRgba(theme.SECONDARY_800, 1) },
                    ]),
                },
                barGap: '-100%',
                label: {
                    show: true,
                    position: 'right',
                    distance: 10,
                    color: theme.SECONDARY_700,
                    fontFamily: theme.FONT_FAMILY,
                    fontSize: 20,
                    fontWeight: 500,
                    formatter: (p: any) => {
                        const v = values[p.dataIndex];
                        return v <= 20 ? `${labels[p.dataIndex]} (${v})` : '';
                    },
                },
            },
        ],
    };
};

// Tags de rich-text para colorear el número de score por severidad (mismo patrón que ya
// usa el radar) — declarados una sola vez, reutilizables por cualquier horizontal_bar.
const SEVERITY_LABEL_RICH: Record<string, any> = {
    sev_success: { color: theme.CHART_SUCCESS, fontWeight: 700, fontSize: 20 },
    sev_warning: { color: theme.CHART_WARNING, fontWeight: 700, fontSize: 20 },
    sev_error: { color: theme.CHART_ERROR, fontWeight: 700, fontSize: 20 },
    sev_muted: { color: theme.SURFACE_400, fontWeight: 500, fontSize: 14 },
};

const severityRichTag = (value: number): string => {
    if (value >= 70) return 'sev_success';
    if (value >= 55) return 'sev_warning';

    return 'sev_error';
};

/**
 * Variante "lista con severidad" de horizontal_bar (ver HorizontalBarElement.variant), ej.
 * "Score por Departamento". A diferencia de la barra plana de siempre: ícono +
 * nombre en el eje Y (en vez de texto dentro de la barra), barra coloreada por umbral sobre
 * un track gris, marcador circular en la punta, y el score alineado en una columna fija a la
 * derecha (no pegado al final de cada barra, cuyo largo varía).
 */
const buildSeverityListBar = (hBarElement: any, labels: string[], values: number[]): Opt => {
    const max = Number(hBarElement.max ?? 100) || 100;
    const iconKeys: string[] = hBarElement.iconKeys ?? [];

    // El texto plano mezclado con un tag de rich-text (`{icon|} Nombre`) no lo pintaba el
    // renderer de ECharts para category axis (mismo tipo de problema que ya se vio en el
    // radar) — se envuelve TODO en tags explícitos, nunca texto suelto.
    const axisNameRich: Record<string, any> = {
        ...SEVERITY_LABEL_RICH,
        deptLabel: { color: theme.SECONDARY_800, fontWeight: 600, fontSize: 14 },
    };
    const yAxisNames = labels.map((label, i) => {
        const iconKey = iconKeys[i];
        const uri = iconKey ? departmentIconDataUri(iconKey) : null;
        if (!uri) return `{deptLabel|${label}}`;

        const tag = `deptIcon_${iconKey}_${i}`;
        axisNameRich[tag] = { height: 16, width: 16, align: 'center', verticalAlign: 'middle', backgroundColor: { image: uri } };

        return `{${tag}|} {deptLabel|${label}}`;
    });

    // Punto fijo en x=max con marcador invisible, solo para anclar el label del score en
    // una columna alineada a la derecha — independiente de qué tan larga sea cada barra.
    const scoreAnchorData = values.map((v, i) => ({
        value: [max, i],
        label: {
            formatter: () => `{${severityRichTag(v)}|${v}}{sev_muted|/${max}}`,
        },
    }));

    const markerData = values.map((v, i) => ({
        value: [v, i],
        itemStyle: { borderColor: severityColor(v) },
    }));

    return {
        tooltip: { show: false },
        grid: { left: 190, right: 90, top: 12, bottom: 12, containLabel: false },

        xAxis: {
            type: 'value',
            min: 0,
            max,
            interval: max / 5,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: { show: false },
            splitLine: {
                show: true,
                lineStyle: { color: theme.SURFACE_200, type: 'dashed', width: 1 },
            },
        },

        yAxis: {
            type: 'category',
            data: yAxisNames,
            inverse: true,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
                color: theme.SECONDARY_800,
                fontFamily: theme.FONT_FAMILY,
                fontSize: 14,
                fontWeight: 600,
                margin: 16,
                // 'right': el texto crece hacia la izquierda desde el eje, quedando dentro
                // del margen reservado (grid.left) — con 'left' crecía hacia la derecha, por
                // ENCIMA de donde arrancan las barras, y quedaba tapado.
                align: 'right',
                rich: axisNameRich,
                // Sin esto, el eje de categoría en ECharts renderiza el string crudo del
                // `data` (con los tags `{tag|...}` literales, no parseados) — el formatter
                // identidad es lo que activa el parseo de rich-text sobre ese valor. Es
                // justo por lo que el ícono (con su propio `backgroundColor.image`, un caso
                // más "especial" que ECharts sí resuelve incluso crudo) se veía pero el
                // texto plano/tagueado después no.
                formatter: (value: string) => value,
            },
        },

        series: [
            // Track gris de fondo (fijo en `max`) — la barra coloreada se dibuja encima.
            {
                type: 'bar',
                data: values.map(() => max),
                barWidth: 16,
                barGap: '-100%',
                silent: true,
                itemStyle: { color: theme.SURFACE_100, borderRadius: 8 },
            },
            // Barra real, coloreada por severidad de su propio valor.
            {
                type: 'bar',
                data: values,
                barWidth: 16,
                itemStyle: {
                    borderRadius: 8,
                    color: (p: any) => severityColor(values[p.dataIndex]),
                },
            },
            // Marcador circular en la punta de la barra (blanco con anillo del color de severidad).
            {
                type: 'scatter',
                data: markerData,
                symbolSize: 16,
                itemStyle: { color: '#fff', borderWidth: 3 },
                silent: true,
            },
            // Score alineado a la derecha (punto invisible fijo en x=max, solo para el label).
            {
                type: 'scatter',
                data: scoreAnchorData,
                symbolSize: 0,
                silent: true,
                label: {
                    show: true,
                    position: 'right',
                    distance: 8,
                    rich: SEVERITY_LABEL_RICH,
                },
            },
        ],
    };
};

const buildPieChart: Builder = (element) => {
    const pieElement = element as any

    /**
     * Normalize incoming element data.
     * Supports either:
     *  - element.data: [{ label, value }]
     *  - element.labels + element.values arrays
     * Produces: [{ name, value }]
     */
    const raw = pieElement.data
        ? pieElement.data.map((d: any) => ({ value: Number(d.value ?? 0), name: String(d.label) }))
        : (pieElement.labels
            ? pieElement.labels.map((l: any, i: number) => ({
                value: Number((pieElement.values ?? [])[i] ?? 0),
                name: String(l),
            }))
            : [])

    /**
     * Sanitize: keep only finite, positive values.
     * (Avoids NaN slices and removes empty/negative entries.)
     */
    const data = raw.filter((x: any) => Number.isFinite(x.value) && x.value > 0);

    /** Total value for percentage calculations.  */
    const total = data.reduce((acc: number, it: any) => acc + (Number(it.value) || 0), 0);

    /**
     * Layout mode switch:
     * - "Few items"  : <= 8 slices => outside labels, no tags in legend
     * - "Many items" : > 8 slices  => inside tags + 2-column legend
     */
    const MANY_ITEMS = data.length > 8;


    /**
     * Minimum percentage required to display a tag inside the pie slice.
     * Small slices won't show a tag to avoid clutter.
     */
    const LABEL_PCT_THRESHOLD = 8;

    /** Helper: convert absolute value -> percentage of total. */
    const pctOf = (value: number) => (total > 0 ? (value / total) * 100 : 0);

    /** Map slice name -> formatted percentage string for legend display.  */
    const pctMap = new Map<string, string>();
    data.forEach((it: any) => pctMap.set(it.name, `${pctOf(Number(it.value) || 0).toFixed(1)}%`));

    /**
     * Tag generator: 0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA, ...
     * Used for MANY_ITEMS mode to reference legend items from inside the chart.
     */
    const indexToTag = (i: number) => {
        const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let n = i;
        let s = '';
        do {
            s = A[n % 26] + s;
            n = Math.floor(n / 26) - 1;
        } while (n >= 0);
        return s;
    };


    /** Extract ordered names and compute a split point for a 2-column legend in MANY_ITEMS mode.  */
    const names = data.map((d: any) => d.name);
    const half = Math.ceil(names.length / 2);

    /** Map slice name -> tag (A, B, C...) */
    const tagMap = new Map<string, string>();
    names.forEach((name: string, i: number) => tagMap.set(name, indexToTag(i)));

    /** Helper: truncate long labels to keep legend tidy. */
    const truncate = (s: string, max = 18) => (s.length > max ? s.slice(0, max - 1) + '…' : s);

    /**
     * Color palette: cycles through DEFAULT_CHART_COLORS (8 base colors).
     * Ensures consistent color assignment across legend and series.
     */
    const palette = Array.from({ length: data.length }, (_, i) => DEFAULT_CHART_COLORS[i % DEFAULT_CHART_COLORS.length]);

    /**
     * Determine if we need to show a disclaimer:
     * Only relevant when MANY_ITEMS mode is on and at least one slice is below the threshold,
     * meaning that slice will NOT show a tag inside the pie.
     */
    const hasHiddenTags =
        MANY_ITEMS && data.some((it: any) => pctOf(Number(it.value) || 0) < LABEL_PCT_THRESHOLD);

    /**
     * Legend "rich text" styles (ONLY used in MANY_ITEMS mode):
     * - tag: pill/badge for A/B/C...
     * - label: product name
     * - pct: percentage
     */
    const legendRich = {
        tag: {
            color: theme.SECONDARY_800,
            fontFamily: theme.FONT_FAMILY,
            fontSize: 13,
            fontWeight: 900,
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderColor: hexToRgba(theme.SECONDARY_600, 0.22),
            borderWidth: 1,
            borderRadius: 6,
            padding: [2, 6],
            width: 26,
            align: 'center',
        },
        label: {
            color: theme.SECONDARY_700,
            fontFamily: theme.FONT_FAMILY,
            fontSize: 14,
            fontWeight: 600,
            padding: [0, 0, 0, 2],
        },
        pct: {
            color: theme.SECONDARY_600,
            fontFamily: theme.FONT_FAMILY,
            fontSize: 14,
            fontWeight: 800,
            padding: [0, 0, 0, 6],
        },
    };

    /**
     * Legend formatter for MANY_ITEMS:
     * Shows: [TAG pill]  Label  Percent
     * Uses ECharts rich text syntax: {styleName|text}
     */
    const legendTextMany = (name: string) => {
        const tag = tagMap.get(name) ?? '';
        const pct = pctMap.get(name) ?? '';
        const label = truncate(name, 16);
        return `{tag|${tag}}  {label|${label}} {pct|${pct}}`;
    };

    /**
     * Legend formatter for FEW ITEMS:
     * Shows: Label  Percent (no tag, since no tags exist inside the chart).
     */
    const legendTextFew = (name: string) => {
        const pct = pctMap.get(name) ?? '';
        const label = truncate(name, 22);
        return `${label}  ${pct}`;
    };

    /**
     * Shared legend config for MANY_ITEMS:
     * Smaller markers + vertical legend.
     */
    const legendCommonMany = {
        itemWidth: 18,
        itemHeight: 10,
        itemGap: 10,
        textStyle: {
            rich: legendRich,
            color: theme.SECONDARY_600,
            fontFamily: theme.FONT_FAMILY,
            fontSize: 14,
            fontWeight: 500,
        },
        formatter: legendTextMany,
    };

    /**
     * Shared legend config for FEW ITEMS:
     * Slightly larger markers + horizontal legend.
     */
    const legendCommonFew = {
        itemWidth: 24,
        itemHeight: 12,
        itemGap: 16,
        textStyle: {
            color: theme.SECONDARY_600,
            fontFamily: theme.FONT_FAMILY,
            fontSize: 16,
            fontWeight: 500,
        },
        formatter: legendTextFew,
    };

    return {
        backgroundColor: 'transparent',
        tooltip: { show: false },
        color: palette,

        /**
         * Optional disclaimer when some slices won't show a tag inside the chart.
         * (Only shown in MANY_ITEMS mode and only if it's actually needed.)
         */
        ...(hasHiddenTags
            ? {
                graphic: [
                    {
                        type: 'text',
                        left: 'center',
                        top: '62%',
                        style: {
                            text: `Nota: Las letras dentro del gráfico aparecen solo en segmentos ≥ ${LABEL_PCT_THRESHOLD}%.`,
                            fill: theme.SECONDARY_600,
                            fontFamily: theme.FONT_FAMILY,
                            fontSize: 10,
                            fontWeight: 600,
                            textAlign: 'center',
                        },
                    },
                ],
            }
            : {}),

        /**
         * Legend layout:
         * - MANY_ITEMS: two vertical columns (left/right) starting at ~62% height
         * - FEW ITEMS : single horizontal legend near bottom
         */
        legend: { show: false },

        /**
         * Series configuration:
         * - MANY_ITEMS: show inside tags only if slice >= threshold; hide label lines.
         * - FEW ITEMS : show classic outside labels with name + percentage.
         */
        series: [
            {
                type: 'pie',

                // Slightly smaller & higher center when MANY_ITEMS (makes room for legend below)
                radius: MANY_ITEMS ? '52%' : '50%',
                center: MANY_ITEMS ? ['50%', '30%'] : ['50%', '42%'],
                avoidLabelOverlap: true,
                minAngle: 2,
                minShowLabelAngle: 0,
                itemStyle: { borderWidth: 0 },

                /**
                 * Labels:
                 * - MANY_ITEMS: tags inside slices (A/B/C...) only above threshold
                 * - FEW ITEMS : outside labels with name + percent
                 */
                label: MANY_ITEMS
                    ? {
                        show: true,
                        position: 'inside',
                        color: '#fff',
                        fontFamily: theme.FONT_FAMILY,
                        fontSize: 16,
                        fontWeight: 900,
                        formatter: (p: any) => {
                            const pct = Number(p.percent ?? 0);
                            if (pct < LABEL_PCT_THRESHOLD) return '';
                            return tagMap.get(p.name) ?? '';
                        },
                    }
                    : {
                        show: true,
                        position: 'outside',
                        color: theme.SECONDARY_600,
                        fontFamily: theme.FONT_FAMILY,
                        fontSize: 16,
                        fontWeight: 500,
                        lineHeight: 20,
                        formatter: (p: any) => `${p.name}\n${Number(p.percent ?? 0).toFixed(1)}%`,
                    },

                /**
                 * Label connector lines:
                 * - MANY_ITEMS: hidden (we are using inside tags)
                 * - FEW ITEMS : enabled for outside labels
                 */
                labelLine: MANY_ITEMS
                    ? { show: false }
                    : { show: true, length: 14, length2: 10, lineStyle: { width: 2 } },

                /**
                 * Hide overlapping outside labels only in FEW ITEMS mode.
                 * (In MANY_ITEMS mode we don't use outside labels.)
                 */
                ...(MANY_ITEMS ? {} : { labelLayout: { hideOverlap: true } }),

                data,
            },
        ],
    };
};

const buildDoughnutChart: Builder = (element) => {
    const d = element as any

    const raw = Array.isArray(d.data)
        ? d.data.map((it: any) => ({ name: String(it.label), value: Number(it.value ?? 0) }))
        : (Array.isArray(d.labels) ? d.labels : []).map((l: any, i: number) => ({
            name: String(l),
            value: Number((Array.isArray(d.values) ? d.values : [])[i] ?? 0),
        }))

    const data = raw.filter((x: any) => Number.isFinite(x.value) && x.value > 0)
    if (data.length === 0) return null

    const palette = Array.from(
        { length: data.length },
        (_, i) => DEFAULT_CHART_COLORS[i % DEFAULT_CHART_COLORS.length]
    )

    const names = data.map((x: any) => x.name)
    const maxLabelLen = Math.max(0, ...names.map((n: string) => n.length))
    const USE_COLUMNS = data.length > 6 || maxLabelLen > 24

    // ✅ ahora el legend ya NO vive en el canvas, por eso el donut puede ir más abajo/centrado
    const donutCenterY = USE_COLUMNS ? '48%' : '54%'
    const donutRadius = USE_COLUMNS ? ['48%', '72%'] : ['50%', '76%']
    return {
        backgroundColor: 'transparent',
        tooltip: { show: false },
        color: palette,

        // ✅ Legend SVG OFF (lo hacemos en HTML)
        legend: { show: false },

        series: [
            {
                type: 'pie',
                radius: donutRadius,
                center: ['50%', donutCenterY],
                padAngle: USE_COLUMNS ? 1 : 2,
                avoidLabelOverlap: true,
                // @ts-ignore
                sort: null,
                itemStyle: {
                    borderColor: theme.SECTION_BG_DEFAULT ?? 'rgba(255,255,255,0.9)',
                    borderWidth: 8,
                    borderRadius: 14,
                },
                label: {
                    show: true,
                    position: 'inside',
                    fontFamily: theme.FONT_FAMILY,
                    fontWeight: 900,
                    color: '#fff',
                    formatter: (p: any) => {
                        const pct = Number(p.percent ?? 0)
                        return pct >= 8 ? `${Math.round(pct)}%` : ''
                    },
                },
                labelLine: { show: false },
                emphasis: { scale: false },
                data,
            },
        ],
    }
};

// `rich` de axisName necesita los tags declarados de antemano — se construyen todos una
// sola vez (no solo los que use este radar en particular), es barato y evita rearmarlo
// por cada render. Dos tags por dimensión: el ícono (imagen) y el texto (mismo color que
// el ícono, ver `radarText_*` — el nombre de la dimensión toma el color de su ícono, no
// un color plano único). Íconos/colores en ../icons.ts — compartidos con RichText.vue
// (celdas de tabla con ícono+texto).
const RADAR_AXIS_NAME_RICH: Record<string, any> = Object.fromEntries(
    Object.entries(DIMENSION_ICONS).flatMap(([key, def]) => [
        [`radarIcon_${key}`, { height: 14, width: 14, align: 'center', verticalAlign: 'middle', backgroundColor: { image: dimensionIconDataUri(key) } }],
        [`radarText_${key}`, { color: def.color }],
    ])
);

const buildRadarChart: Builder = (element) => {
    const radarElement = element as any;

    if (!radarElement.labels || radarElement.labels.length === 0) return null;

    // `max` es opcional en el JSON del elemento — si se manda (ej. 100, para que la escala
    // sea fija y comparable entre reportes, igual que `suggestedMax: 100` del radar web) se
    // usa tal cual. Si no se manda, se conserva la fórmula original: escalar al valor máximo
    // real de los datos (con un piso de 5 para que un grupo de valores muy chicos no quede
    // aplastado contra el centro).
    const RADAR_MAX = radarElement.max !== undefined && radarElement.max !== null
        ? Number(radarElement.max)
        : Math.max(...(radarElement.values as number[]), 5);

    const wrapLabel = (text: string, max = 18) => {
        const words = String(text).split(' ');
        const lines: string[] = [];
        let line = '';
        for (const w of words) {
            const next = line ? `${line} ${w}` : w;
            if (next.length > max) {
                if (line) lines.push(line);
                line = w;
            } else {
                line = next;
            }
        }
        if (line) lines.push(line);
        return lines.join('\n');
    };

    return {
        radar: {
            center: ['50%', '48%'],
            radius: '62%',
            splitNumber: 5,
            indicator: radarElement.labels.map((l: string, i: number) => {
                const iconKey = (radarElement.iconKeys ?? [])[i];
                const hasIcon = !!iconKey && !!DIMENSION_ICONS[iconKey];
                const wrapped = wrapLabel(l);

                if (!hasIcon) {
                    return { name: wrapped, max: RADAR_MAX };
                }

                // El texto se colorea línea por línea con el mismo tag de color del ícono
                // (`radarText_*`) — no se envuelve el bloque completo en un solo tag porque
                // el `\n` de wrapLabel() se interpreta ANTES de parsear los tags de esa
                // línea, así que un tag no puede cruzar un salto de línea.
                const coloredText = wrapped
                    .split('\n')
                    .map((line) => `{radarText_${iconKey}|${line}}`)
                    .join('\n');

                // El ícono va como un tag de rich-text vacío (solo su backgroundColor.image)
                // pegado antes del texto — queda en la misma línea que la primera palabra.
                const name = `{radarIcon_${iconKey}|} ${coloredText}`;

                return { name, max: RADAR_MAX };
            }),

            // Fondo blanco liso (igual que el web) — sin bandas de color alternadas.
            splitLine: { lineStyle: { color: theme.SURFACE_200, width: 1 } },
            axisLine: { lineStyle: { color: theme.SURFACE_200, width: 1 } },
            splitArea: { show: false },
            axisName: {
                color: theme.RADAR_LABEL_COLOR,
                fontFamily: theme.FONT_FAMILY,
                fontSize: 14,
                lineHeight: 22,
                fontWeight: 500,
                padding: [4, 8],
                rich: RADAR_AXIS_NAME_RICH,
            },
        },

        series: [
            {
                type: 'radar',
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { color: theme.PRIMARY_600, width: 3 },
                itemStyle: { color: theme.PRIMARY_600, borderColor: '#fff', borderWidth: 2 },
                // Relleno semi-transparente del color primario.
                areaStyle: { color: hexToRgba(theme.PRIMARY_500, 0.18) },
                label: {
                    show: true,
                    // `label.color` como función no lo respeta el renderer de `radar` en
                    // ECharts (queda en negro) — se usa el patrón de rich text (formatter que
                    // envuelve el valor en un tag + estilos en `rich`), que sí funciona para
                    // colorear cada punto según su propio score, igual que el radar del web.
                    formatter: (params: any) => {
                        const v = Number(params.value);
                        const tag = v >= 70 ? 'good' : v >= 55 ? 'warn' : 'bad';

                        return `{${tag}|${params.value}}`;
                    },
                    rich: {
                        good: { color: theme.CHART_SUCCESS, fontWeight: 700, fontSize: 12 },
                        warn: { color: theme.CHART_WARNING, fontWeight: 700, fontSize: 12 },
                        bad: { color: theme.CHART_ERROR, fontWeight: 700, fontSize: 12 },
                    },
                },
                data: [{ value: radarElement.values, name: radarElement.title }],
            },
        ],
    };
};

const buildStackedBar: Builder = (element) => {
    const stackedElement = element as any;

    const rows = Array.isArray(stackedElement.data) ? stackedElement.data : [];
    const categories = rows.map((d: any) => String(d.label ?? ''));

    const firstValues = rows?.[0]?.values ?? {};
    const seriesKeys = Object.keys(firstValues);

    const pickColor = (i: number) => DEFAULT_CHART_COLORS[i % DEFAULT_CHART_COLORS.length];

    const series: BarSeriesOption[] = seriesKeys.map((key: string, i: number) => {
        const base = pickColor(i);

        return {
            name: key,
            type: 'bar' as const,
            stack: 'total',
            barWidth: 34,
            itemStyle: {
                borderRadius: i === seriesKeys.length - 1 ? [0, 18, 18, 0] : 0,
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: hexToRgba(base, 0.95) },
                    { offset: 1, color: hexToRgba(base, 1) },
                ]),
            },
            emphasis: { focus: 'series' as const },
            label: {
                show: true,
                position: 'inside',
                color: '#ffffff',
                fontFamily: theme.FONT_FAMILY,
                fontSize: 18,
                fontWeight: 600,
                formatter: (p: any) => (Number(p.value ?? 0) > 0 ? `${p.value}` : ''),
            },
            data: rows.map((d: any) => Number(d?.values?.[key] ?? 0)),
        }
    })

    return {
        backgroundColor: 'transparent',
        textStyle: { fontFamily: theme.FONT_FAMILY },
        tooltip: { show: false },

        legend: {
            show: true,
            top: 6,
            left: 'center',
            itemWidth: 34,
            itemHeight: 18,
            itemGap: 22,
            textStyle: {
                color: theme.SECONDARY_700,
                fontFamily: theme.FONT_FAMILY,
                fontSize: 18,
                fontWeight: 600,
            },
        },

        grid: { left: 26, right: 26, top: 58, bottom: 22, containLabel: true },

        xAxis: {
            type: 'value',
            axisTick: { show: false },
            axisLine: { lineStyle: { color: hexToRgba(theme.SECONDARY_600, 0.45), width: 2 } },
            axisLabel: {
                color: theme.SECONDARY_700,
                fontFamily: theme.FONT_FAMILY,
                fontSize: 18,
                fontWeight: 600,
                margin: 14,
            },
            splitLine: { show: true, lineStyle: { color: hexToRgba(theme.PRIMARY_500, 0.55), type: 'dashed', width: 2 } },
        },

        yAxis: {
            type: 'category',
            data: categories,
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: {
                color: theme.SECONDARY_700,
                fontFamily: theme.FONT_FAMILY,
                fontSize: 20,
                fontWeight: 700,
                margin: 18,
                width: 160,
                overflow: 'break',
            },
        },

        series,
    };
};

const buildVelocimeter: Builder = (element) => {
    const v = element as any;

    const min = v.min ?? 0;
    const max = v.max ?? 100;
    const value = Number(v.value ?? 0);

    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));

    return {
        series: [
            {
                type: 'gauge',
                startAngle: 210,
                endAngle: -30,
                min,
                max,
                radius: '100%',
                center: ['50%', '60%'],

                axisLine: {
                    roundCap: false,
                    lineStyle: {
                        width: 18,
                        color: [
                            [ratio, theme.PRIMARY_400],
                            [1, hexToRgba(theme.SECONDARY_600, 0.10)],
                        ],
                    },
                },

                pointer: { show: true, length: '50%', width: 4, itemStyle: { color: theme.PRIMARY_400 } },

                anchor: { show: true, showAbove: true, size: 10, itemStyle: { color: theme.PRIMARY_400, borderWidth: 0 } },

                axisTick: {
                    show: true,
                    splitNumber: 4,
                    distance: -14,
                    length: 7,
                    lineStyle: { color: theme.SECONDARY_600, width: 1.1 },
                },

                splitLine: {
                    show: true,
                    distance: -14,
                    length: 14,
                    lineStyle: { color: theme.SECONDARY_600, width: 1.5 },
                },

                detail: {
                    show: true,
                    valueAnimation: false,
                    offsetCenter: [0, '42%'],
                    fontFamily: theme.FONT_FAMILY,
                    fontSize: 28,
                    fontWeight: 700,
                    color: theme.SECONDARY_600,
                    formatter: (val: number) => (Number.isFinite(val) ? val.toFixed(1) : ''),
                },

                title: { show: false },
                progress: { show: false },
                data: [{ value }],
                itemStyle: { color: theme.PRIMARY_400 },

                axisLabel: {
                    show: true,
                    distance: 22,
                    color: theme.SECONDARY_600,
                    fontFamily: theme.FONT_FAMILY,
                    fontSize: 14,
                    fontWeight: 800,
                    formatter: (val: number) => `${Math.round(val)}`,
                },
            },
        ],
    };
};

const buildScatterPlot: Builder = (element) => {
    const scatterElement = element as any;

    const points = Array.isArray(scatterElement.positions) ? scatterElement.positions : [];
    const data = points.map((p: any) => ({
        value: [Number(p.x ?? 0), Number(p.y ?? 0)],
        name: String(p.label ?? ''),
    }));

    const AXIS_LINE = hexToRgba(theme.SECONDARY_600, 0.35);
    const GRID_LINE = hexToRgba(theme.PRIMARY_500, 0.22);

    return {
        backgroundColor: 'transparent',
        textStyle: { fontFamily: theme.FONT_FAMILY },
        grid: { left: 10, right: 30, top: 84, bottom: 70, containLabel: true },
        tooltip: { show: false },

        xAxis: {
            type: 'value',
            name: scatterElement.x_axis ?? '',
            nameLocation: 'end',
            nameGap: 18,
            boundaryGap: ['8%', '8%'],
            nameTextStyle: {
                color: theme.SECONDARY_700,
                fontFamily: theme.FONT_FAMILY,
                fontSize: 18,
                fontWeight: 700,
                align: 'right',
            },
            axisLine: { lineStyle: { color: AXIS_LINE, width: 2 } },
            axisTick: { show: false },
            axisLabel: { color: theme.SECONDARY_600, fontFamily: theme.FONT_FAMILY, fontSize: 16, fontWeight: 500, margin: 12 },
            splitLine: { show: true, lineStyle: { color: GRID_LINE, type: 'dashed', width: 2 } },
        },

        yAxis: {
            type: 'value',
            name: scatterElement.y_axis ?? '',
            nameLocation: 'end',
            nameGap: 18,
            boundaryGap: ['10%', '10%'],
            nameTextStyle: { color: theme.SECONDARY_700, fontFamily: theme.FONT_FAMILY, fontSize: 18, fontWeight: 700, align: 'left' },
            axisLine: { lineStyle: { color: AXIS_LINE, width: 2 } },
            axisTick: { show: false },
            axisLabel: { color: theme.SECONDARY_600, fontFamily: theme.FONT_FAMILY, fontSize: 16, fontWeight: 500, margin: 12 },
            splitLine: { show: true, lineStyle: { color: GRID_LINE, type: 'dashed', width: 2 } },
        },

        series: [
            {
                type: 'scatter',
                data,
                symbolSize: 26,
                itemStyle: {
                    color: theme.SECONDARY_800,
                    borderColor: 'rgba(255,255,255,0.85)',
                    borderWidth: 3,
                    shadowBlur: 10,
                    shadowColor: hexToRgba(theme.SECONDARY_600, 0.18),
                },
                label: {
                    show: true,
                    position: 'top',
                    distance: 12,
                    color: theme.SECONDARY_700,
                    fontFamily: theme.FONT_FAMILY,
                    fontSize: 18,
                    fontWeight: 700,
                    formatter: (p: any) => p?.data?.name ?? '',
                },
            },
        ],
    };
};

const builders: Record<string, Builder> = {
    bar_chart: buildBarChart,
    horizontal_bar: buildHorizontalBar,
    pie_chart: buildPieChart,
    doughnut_chart: buildDoughnutChart,
    radar_chart: buildRadarChart,
    stacked_bar: buildStackedBar,
    velocimeter: buildVelocimeter,
    scatter_plot: buildScatterPlot,
};

// Export principal
export const buildChartOption = (element: PdfElement): Opt | null => {
    const builder = builders[element.type]
    return builder ? builder(element) : null
}
