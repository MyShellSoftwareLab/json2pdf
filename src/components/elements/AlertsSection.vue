<template>
    <div class="asec">
        <div class="asec__heading">
            <div class="asec__icon-circle">
                <img v-if="warningIconSrc" class="asec__icon" :src="warningIconSrc" alt="" />
            </div>
            <div>
                <div v-if="element.title" class="asec__title">{{ element.title }}</div>
                <div v-if="element.subtitle" class="asec__subtitle">{{ element.subtitle }}</div>
            </div>
        </div>

        <div class="asec__card">
            <table class="asec__table" lang="es">
                <colgroup>
                    <col style="width: 21%" />
                    <col style="width: 18%" />
                    <col style="width: 17%" />
                    <col style="width: 34%" />
                    <col style="width: 10%" />
                </colgroup>
                <thead>
                    <tr>
                        <th class="asec__th asec__th--left">Alerta</th>
                        <th class="asec__th asec__th--left">Departamento</th>
                        <th class="asec__th asec__th--left">Riesgo</th>
                        <th class="asec__th asec__th--left">Acción recomendada</th>
                        <th class="asec__th">Nivel</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, i) in element.rows" :key="i">
                        <td class="asec__td">
                            <div class="asec__alert-cell">
                                <div class="asec__alert-icon" :style="{ backgroundColor: hexToRgba(alertIconColor(row.iconKey), 0.14) }">
                                    <img v-if="alertIconDataUri(row.iconKey)" class="asec__alert-icon-img" :src="alertIconDataUri(row.iconKey) as string" alt="" />
                                </div>
                                <div class="asec__alert-text">
                                    <div class="asec__alert-title">{{ row.title }}</div>
                                    <div class="asec__alert-desc">{{ row.description }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="asec__td">
                            <div class="asec__dept-cell">
                                <div class="asec__dept-badge">
                                    <img v-if="departmentIconMonoDataUri(row.departmentIconKey, theme.PRIMARY_600)" class="asec__dept-icon" :src="departmentIconMonoDataUri(row.departmentIconKey, theme.PRIMARY_600) as string" alt="" />
                                </div>
                                <span class="asec__dept-name">{{ row.department }}</span>
                            </div>
                        </td>
                        <td class="asec__td">
                            <div class="asec__risk-cell">
                                <div class="asec__risk-segments">
                                    <span
                                        v-for="seg in riskSegmentsTotal" :key="seg"
                                        class="asec__risk-seg"
                                        :style="{ backgroundColor: seg <= row.riskSegments ? row.riskColor : theme.SURFACE_100 }" />
                                </div>
                                <span class="asec__risk-label" :style="{ color: row.riskColor }">{{ row.riskLabel }}</span>
                            </div>
                        </td>
                        <td class="asec__td asec__td--muted">{{ row.action }}</td>
                        <td class="asec__td">
                            <span class="asec__level-pill" :style="{ backgroundColor: row.levelColor }">{{ row.level }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AlertsSectionElement } from '../../types';
import * as theme from '../../theme';
import { alertIconDataUri, ALERT_ICONS, departmentIconMonoDataUri, buildDataUri } from '../../icons';

const props = defineProps<{
    element: AlertsSectionElement;
}>();

const riskSegmentsTotal = props.element.riskSegmentsTotal ?? 6;

const warningIconSrc = buildDataUri({
    paths: [
        '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>',
        '<path d="M12 9v4"/>',
        '<path d="M12 17h.01"/>',
    ],
    color: theme.CHART_ERROR,
});

const alertIconColor = (key: string) => ALERT_ICONS[key]?.color ?? theme.SURFACE_400;

const hexToRgba = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
</script>

<style scoped>
/* =============================================================================
   ALERTS SECTION — "Alertas Activas": tabla de alertas individuales con ícono por tipo,
   insignia de departamento, mini-barra de riesgo y píldora de nivel.
============================================================================= */
.asec {
    break-inside: avoid;
}

.asec__heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
}

.asec__icon-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: v-bind('theme.HEATMAP_ERROR_BG');
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.asec__icon {
    width: 20px;
    height: 20px;
}

.asec__title {
    font-size: v-bind('theme.CHART_TITLE_FONT_SIZE');
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    color: v-bind('theme.CHART_TITLE_COLOR');
    letter-spacing: -0.5px;
    line-height: 1.15;
}

.asec__subtitle {
    font-size: 14px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_400');
    margin-top: 2px;
}

.asec__card {
    background: v-bind('theme.SURFACE_0');
    border: 1px solid v-bind('theme.SURFACE_200');
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.asec__table {
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
}

.asec__th {
    background: v-bind('theme.SECONDARY_500');
    color: v-bind('theme.SURFACE_0');
    font-size: 10.5px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-align: center;
    padding: 12px 14px;
}

.asec__th--left {
    text-align: left;
}

.asec__th:first-child {
    border-radius: 10px 0 0 10px;
}

.asec__th:last-child {
    border-radius: 0 10px 10px 0;
}

.asec__td {
    padding: 14px;
    text-align: center;
    vertical-align: middle;
    font-size: 12px;
    border-bottom: 1px solid v-bind('theme.SURFACE_100');
}

.asec__table tbody tr:last-child .asec__td {
    border-bottom: none;
}

.asec__td--muted {
    text-align: left;
    color: v-bind('theme.SURFACE_500');
    line-height: 1.35;
}

.asec__alert-cell {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    text-align: left;
}

.asec__alert-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.asec__alert-icon-img {
    width: 15px;
    height: 15px;
}

.asec__alert-text {
    min-width: 0;
}

.asec__alert-title {
    font-size: 12.5px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    color: v-bind('theme.SURFACE_950');
    line-height: 1.3;
}

.asec__alert-desc {
    font-size: 11px;
    color: v-bind('theme.SURFACE_400');
    margin-top: 2px;
    line-height: 1.35;
}

.asec__dept-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-start;
    font-size: 12px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_950');
}

.asec__dept-badge {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: v-bind('theme.PRIMARY_50');
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.asec__dept-icon {
    width: 14px;
    height: 14px;
}

/* flex+min-width:0 para que un nombre largo ("Administración") envuelva a una segunda línea
   dentro de la celda en vez de desbordarse sobre la columna Riesgo (mismo fix que ya se
   aplicó en DepartmentTable.vue). */
.asec__dept-name {
    flex: 1;
    min-width: 0;
    hyphens: auto;
    overflow-wrap: break-word;
}

/* Segmentos arriba, etiqueta debajo (no en línea) — en línea, segmentos+etiqueta juntos no
   entraban en el ancho de la columna y se desbordaban sobre "Acción recomendada". */
.asec__risk-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
}

.asec__risk-segments {
    display: flex;
    gap: 2px;
}

.asec__risk-seg {
    width: 9px;
    height: 6px;
    border-radius: 2px;
    flex-shrink: 0;
}

.asec__risk-label {
    font-size: 11px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    white-space: nowrap;
}

.asec__level-pill {
    display: inline-block;
    color: v-bind('theme.SURFACE_0');
    font-size: 10.5px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    padding: 4px 14px;
    border-radius: v-bind('theme.RADIUS_FULL');
}
</style>
