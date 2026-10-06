<template>
    <!-- 1) String/Number: soporta multiline + bold segments -->
    <template v-if="isString">
        <span class="rt">
            <span v-for="(line, li) in parsedLines" :key="li">
                <template v-for="(seg, si) in line" :key="`${li}-${si}`">
                    <span :class="seg.bold ? 'rt__bold' : ''">{{ seg.text }}</span>
                </template>
                <br v-if="li < parsedLines.length - 1" />
            </span>
        </span>
    </template>

    <!-- 2) Barra de progreso (ej. score de un indicador/dimensión sobre 100) -->
    <div v-else-if="isProgress" class="rt rt__progress">
        <div class="rt__progress-track">
            <div class="rt__progress-fill" :style="progressFillStyle" />
        </div>
        <span class="rt__progress-label" :style="{ color: progressColor }">{{ progressLabel }}</span>
    </div>

    <!-- 3) Ícono + texto (ej. nombre de dimensión con su ícono, ver icons.ts) -->
    <span v-else-if="isIconLabel" class="rt rt__icon-label">
        <img v-if="iconLabelSrc" class="rt__icon-label-img" :src="iconLabelSrc" alt="" />
        <span>{{ contentObj.text }}</span>
    </span>

    <!-- 4) Heatmap de celda completa — el fondo lo pinta el <td> (ver Table.vue:
         cellBackground()), aquí solo el texto en el tono oscuro correspondiente. -->
    <span v-else-if="isCellFill" class="rt rt__heatmap-text" :style="{ color: heatmapTextColor }">
        {{ contentObj.text }}
    </span>

    <!-- 5) Badge por severidad -->
    <span v-else-if="isSeverity" class="rt rt__badge" :style="badgeStyle">
        {{ contentObj.text }}
    </span>

    <!-- 3) Texto con estilos custom -->
    <span v-else-if="isStyled" class="rt rt--styled" :style="customStyle">
        {{ contentObj.text }}
    </span>

    <!-- 4) Object normal -->
    <span v-else class="rt">{{ contentObj.text }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as theme from '../theme';
import { dimensionIconDataUri } from '../icons';

type RichContent =
    | string
    | number
    | { text?: string; severity?: string; color?: string; bg?: string; [key: string]: any }
    | null

const props = defineProps<{ content: RichContent }>();

const isString = computed(() => typeof props.content === 'string' || typeof props.content === 'number');

const contentObj = computed(() => {
    if (props.content === null || props.content === undefined) return { text: '' };
    return typeof props.content === 'object' ? props.content : { text: String(props.content) };
});

const isProgress = computed(() => contentObj.value.type === 'progress');
const isIconLabel = computed(() => contentObj.value.type === 'icon_label');
const isCellFill = computed(() => !isProgress.value && !isIconLabel.value && !!contentObj.value.cellFill && !!contentObj.value.severity);
const isSeverity = computed(() => !isProgress.value && !isIconLabel.value && !isCellFill.value && !!contentObj.value.severity);

const heatmapTextColor = computed(() => {
    switch (contentObj.value.severity) {
        case 'success': return theme.HEATMAP_SUCCESS_TEXT;
        case 'warning': return theme.HEATMAP_WARNING_TEXT;
        default: return theme.HEATMAP_ERROR_TEXT;
    }
});
const isStyled = computed(() => !!(contentObj.value.color || contentObj.value.bg));

const iconLabelSrc = computed(() => (isIconLabel.value ? dimensionIconDataUri(contentObj.value.icon) : null));

const progressMax = computed(() => Number(contentObj.value.max ?? 100) || 100);
const progressPercent = computed(() => {
    const pct = (Number(contentObj.value.value) / progressMax.value) * 100;

    return Math.max(0, Math.min(100, isFinite(pct) ? pct : 0));
});

const progressColor = computed(() => {
    switch (contentObj.value.severity) {
        case 'success': return theme.ACCENT_SUCCESS;
        case 'warning': return theme.ACCENT_WARNING;
        case 'danger':
        case 'error': return theme.ACCENT_ERROR;
        default: return theme.PRIMARY_600;
    }
});

const progressFillStyle = computed(() => ({
    width: `${progressPercent.value}%`,
    backgroundColor: progressColor.value,
}));

const progressLabel = computed(() => {
    if (contentObj.value.label !== undefined) return contentObj.value.label;

    return contentObj.value.max !== undefined
        ? `${contentObj.value.value}/${contentObj.value.max}`
        : contentObj.value.value;
});

type Segment = { text: string; bold: boolean };

// Convierte <br> a \n y <strong>/<b> a **...**
const normalize = (input: string) => {
    return input
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<strong>/gi, '**')
        .replace(/<\/strong>/gi, '**')
        .replace(/<b>/gi, '**')
        .replace(/<\/b>/gi, '**');
};

// Parsea **bold** en segmentos
const parseBoldSegments = (line: string): Segment[] => {
    const segments: Segment[] = [];
    const regex = /\*\*(.+?)\*\*/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
        const start = match.index;
        const end = regex.lastIndex;

        if (start > lastIndex) segments.push({ text: line.slice(lastIndex, start), bold: false });
        segments.push({ text: match[1], bold: true });
        lastIndex = end;
    }

    if (lastIndex < line.length) segments.push({ text: line.slice(lastIndex), bold: false });
    return segments.length ? segments : [{ text: line, bold: false }];
};

const parsedLines = computed(() => {
    const raw = normalize(String(props.content));
    return raw.split('\n').map((l) => parseBoldSegments(l));
});

// SOLO calcula el color por severidad (lo demás vive en CSS)
const badgeStyle = computed(() => {
    const severity = contentObj.value.severity;
    let bg = theme.SURFACE_400;

    if (severity === 'success') bg = theme.ACCENT_SUCCESS;
    else if (severity === 'danger' || severity === 'error') bg = theme.ACCENT_ERROR;
    else if (severity === 'warning') bg = theme.ACCENT_WARNING;

    return { backgroundColor: bg };
});

const customStyle = computed(() => {
    return {
        color: contentObj.value.color,
        backgroundColor: contentObj.value.bg
    };
});
</script>

<style scoped>
/* =============================================================================
   RichText base
   - Debe heredar font-family y color del contenedor padre (Elements/Chart/etc.)
============================================================================= */
.rt {
    display: inline;
}

/* Segmento bold para strings */
.rt__bold {
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
}

/* =============================================================================
   Barra de progreso (ej. score de un indicador/dimensión sobre 100)
   - El ancho del relleno y su color vienen de :style (computed, ver progressFillStyle)
============================================================================= */
.rt__progress {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.rt__progress-track {
    flex: 1;
    height: 10px;
    border-radius: v-bind('theme.RADIUS_FULL');
    background-color: color-mix(in srgb, v-bind('theme.SECONDARY_600') 12%, transparent);
    overflow: hidden;
}

.rt__progress-fill {
    height: 100%;
    border-radius: v-bind('theme.RADIUS_FULL');
}

.rt__progress-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    min-width: 28px;
    text-align: right;
}

/* =============================================================================
   Ícono + texto (ej. nombre de dimensión con su ícono)
============================================================================= */
.rt__icon-label {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    gap: 6px;
}

.rt__icon-label-img {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}

/* =============================================================================
   Heatmap de celda completa — solo texto, el fondo lo pinta el <td> (Table.vue)
============================================================================= */
.rt__heatmap-text {
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    font-size: 13px;
}

/* =============================================================================
   Badge por severidad
   - backgroundColor viene de :style (computed)
============================================================================= */
.rt__badge {
    color: v-bind('theme.SURFACE_0');
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    /* pill real del web (DepartmentsWidget/ScoresList): px-2 py-0.5 rounded text-[10px] */
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    display: inline-block;
    line-height: 1.2;
}

/* =============================================================================
   Texto con estilo custom (color/bg)
============================================================================= */
.rt--styled {
    padding: 2px 6px;
    border-radius: 6px;
}
</style>
