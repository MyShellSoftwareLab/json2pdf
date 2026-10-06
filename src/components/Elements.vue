<template>
    <div class="pdf">
        <template v-for="{ element, index, breakBefore } in blocks" :key="index">
            <section
                class="pdf__block"
                :class="[
                    `pdf__block--${element.type}`,
                    { 'pdf__break-before': breakBefore }
                ]"
            >
                <!-- Cover Page (hoja completa, ver break-after en su propio componente) -->
                <CoverPage v-if="element.type === 'cover_page'" :element="element" />

                <!-- Title -->
                <Title v-else-if="element.type === 'title'" :element="element" />

                <!-- Subtitle -->
                <Subtitle v-else-if="element.type === 'subtitle'" :element="element" />

                <!-- Paragraph -->
                <Paragraph v-else-if="element.type === 'paragraph'" :element="element" />

                <!-- Numbered List -->
                <NumberedList v-else-if="element.type === 'numbered_list'" :element="element" />

                <!-- Bullet Points (New) -->
                <BulletPoints v-else-if="element.type === 'bullet_points'" :element="element" />

                <!-- Table -->
                <Table v-else-if="element.type === 'table' && element.rows?.length" :element="element" />

                <!-- Dimension Score Table (ej. "Detalle por Dimensión") -->
                <DimensionScoreTable v-else-if="element.type === 'dimension_score_table' && element.rows?.length" :element="element" />

                <!-- Department Table (ej. "Departamentos") -->
                <DepartmentTable v-else-if="element.type === 'department_table' && element.rows?.length" :element="element" />

                <!-- Indicator Dimension Grid (ej. "Indicadores por Dimensión") -->
                <IndicatorDimensionGrid v-else-if="element.type === 'indicator_dimension_grid' && element.cards?.length" :element="element" />

                <!-- Findings Section (ej. "Hallazgos Principales") -->
                <FindingsSection v-else-if="element.type === 'findings_section' && element.cards?.length" :element="element" />

                <!-- Alerts Section (ej. "Alertas Activas") -->
                <AlertsSection v-else-if="element.type === 'alerts_section' && element.rows?.length" :element="element" />

                <!-- Metric -->
                <Metric v-else-if="element.type === 'metric'" :element="element" />

                <!-- HTML + Tailwind -->
                <HtmlContent v-else-if="element.type === 'html'" :element="element" />

                <!-- Charts -->
                <ChartItem
                    v-else-if="['bar_chart','pie_chart','radar_chart','doughnut_chart','horizontal_bar','stacked_bar','velocimeter','scatter_plot'].includes(element.type)"
                    :element="element" />
            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { PdfElement } from '../types';
import * as theme from '../theme';

// Import refactored components
import CoverPage from './elements/CoverPage.vue';
import Title from './elements/Title.vue';
import Subtitle from './elements/Subtitle.vue';
import Paragraph from './elements/Paragraph.vue';
import NumberedList from './elements/NumberedList.vue';
import BulletPoints from './elements/BulletPoints.vue';
import Table from './elements/Table.vue';
import DimensionScoreTable from './elements/DimensionScoreTable.vue';
import DepartmentTable from './elements/DepartmentTable.vue';
import IndicatorDimensionGrid from './elements/IndicatorDimensionGrid.vue';
import FindingsSection from './elements/FindingsSection.vue';
import AlertsSection from './elements/AlertsSection.vue';
import Metric from './elements/Metric.vue';
import ChartItem from './elements/ChartItem.vue';
import HtmlContent from './elements/HtmlContent.vue';

const props = defineProps({
    elements: {
        type: Array as PropType<PdfElement[]>,
        required: true,
        default: () => []
    }
});

// Bloques a renderizar. `page_break` no genera bloque propio: marca el siguiente bloque con
// `breakBefore`, así no queda una sección vacía que pueda producir una hoja en blanco. Un
// `title` también abre hoja nueva. Nunca se rompe antes del primer bloque ni justo después de
// la portada (que ya cierra con su propio salto), y un `page_break` al final se ignora.
const blocks = computed(() => {
    const out: { element: PdfElement; index: number; breakBefore: boolean }[] = [];
    let pendingBreak = false;

    props.elements.forEach((element, index) => {
        if (element.type === 'page_break') {
            pendingBreak = true;
            return;
        }

        const prev = out[out.length - 1]?.element;
        const breakBefore = !!prev && prev.type !== 'cover_page' && (pendingBreak || element.type === 'title');

        out.push({ element, index, breakBefore });
        pendingBreak = false;
    });

    return out;
});
</script>

<style scoped>
/* =============================================================================
   PDF ROOT
============================================================================= */
.pdf {
    font-family: v-bind('theme.FONT_FAMILY');
    color: v-bind('theme.TEXT_PRIMARY');
    padding: 0 10px;
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}


/* Un bloque por elemento */
.pdf__block {
    margin: 0 0 5px 0;
    /* “ritmo” general */
}

.pdf__break-before {
    break-before: page;
}

/* La portada hace su propio full-bleed (márgenes negativos) — sin esto heredaría el
   margin-bottom por defecto de .pdf__block encima de su propio salto de página. */
.pdf__block--cover_page {
    margin: 0;
}
</style>
