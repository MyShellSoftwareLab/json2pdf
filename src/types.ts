export interface BaseElement {
  type: string;
  [key: string]: any;
}

export interface TextElement extends BaseElement {
  type: 'title' | 'subtitle' | 'paragraph';
  content: string;
}

export interface CoverPageTitleLine {
  text: string;
  // Línea en el color de acento (theme.PRIMARY_400) en vez de blanco.
  accent?: boolean;
}

export interface CoverPageElement extends BaseElement {
  type: 'cover_page';
  // String simple (una sola línea, blanco) o un arreglo de líneas con color mezclado.
  title: string | CoverPageTitleLine[];
  subtitle?: string;
  badge?: string;
  footer?: string;
  // Logo opcional arriba a la izquierda: URL o data URI (ej. "data:image/svg+xml;base64,...").
  logo?: string;
}

// Fuerza que el siguiente elemento empiece en una hoja nueva. No renderiza nada propio.
export interface PageBreakElement extends BaseElement {
  type: 'page_break';
}

// HTML libre con clases de Tailwind (v4). El CSS se compila en el servidor con solo las clases
// usadas (ver services/tailwind.ts) y el HTML se sanitiza antes de renderizar.
export interface HtmlElement extends BaseElement {
  type: 'html';
  content: string;
}

export interface NumberedListElement extends BaseElement {
  type: 'numbered_list';
  items: string[];
}

export interface BulletPointsElement extends BaseElement {
  type: 'bullet_points';
  items: string[];
}

export interface RichContent {
  text: string;
  severity?: 'success' | 'warning' | 'info' | 'error' | 'danger';
  variant?: 'outline' | 'solid' | 'soft';
  // Heatmap de celda completa (ver theme.HEATMAP_*): en vez de una píldora de color sobre
  // fondo blanco, colorea el fondo de TODA la celda de la tabla con un tono claro y el
  // texto en un tono oscuro del mismo color — pensado para tablas anchas (ej. comparativo
  // departamental) donde muchas píldoras se ven pesadas.
  cellFill?: boolean;
  [key: string]: any;
}

export interface ProgressContent {
  type: 'progress';
  value: number;
  max?: number;
  severity?: 'success' | 'warning' | 'info' | 'error' | 'danger';
  label?: string | number;
}

export interface IconLabelContent {
  type: 'icon_label';
  text: string;
  // Clave de ícono (ver DIMENSION_ICONS en icons.ts) — sin match, se muestra solo el texto.
  icon: string;
}

export type TableCell = string | number | RichContent | ProgressContent | IconLabelContent | null;



export interface TableElement extends BaseElement {
  type: 'table';
  title?: string;
  headers: (string | RichContent)[];
  rows: TableCell[][];
}



export interface MetricSubStat {
  value: string | number;
  label: string;
  color?: 'danger' | 'default';
}

export interface MetricElement extends BaseElement {
  type: 'metric';
  title: string;
  value: string | number | RichContent;
  severity?: 'success' | 'warning' | 'info' | 'error' | 'danger';
  interpretation?: string;
  // Variante "hero" (tarjeta oscura destacada): número grande + badge +
  // stats laterales, en vez de la tarjeta simple de color por severidad. Si se omiten
  // `max`/`badge`/`subStats`, se renderiza la tarjeta simple de siempre (sin cambios).
  max?: number; // ej. 100, para mostrar "value/max"
  badge?: string; // ej. "Score"
  subStats?: MetricSubStat[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface BarChartElement extends BaseElement {
  type: 'bar_chart';
  title: string;
  data: ChartDataPoint[];
}

export interface PieChartElement extends BaseElement {
  type: 'pie_chart';
  title: string;
  data: ChartDataPoint[];
}

export interface RadarChartElement extends BaseElement {
  type: 'radar_chart';
  title: string;
  labels: string[];
  values: number[];
  // Escala fija de cada eje (ej. 100, para un radar de scores 0-100 comparable entre
  // reportes). Si se omite, escala al valor máximo real de `values`.
  max?: number;
  // Clave de ícono por eje, mismo orden que `labels`/`values` (ver RADAR_ICONS en
  // chartOptionBuilders.ts: 'skills' | 'performance' | 'growth_potential' |
  // 'digital_competency' | 'automation_potential' | 'culture_engagement' | 'capacity' |
  // 'risk'). Opcional; sin esto (o con una clave no reconocida) ese eje no lleva ícono.
  iconKeys?: string[];
}

export interface DoughnutChartElement extends BaseElement {
  type: 'doughnut_chart';
  title: string;
  labels: string[];
  values: number[];
}

export interface HorizontalBarLegendItem {
  label: string;
  color: string;
}

export interface HorizontalBarElement extends BaseElement {
  type: 'horizontal_bar';
  title: string;
  labels: string[];
  values: number[];
  // Escala fija del eje (ej. 100). Si se omite, ECharts autoescala.
  max?: number;
  // Variante "lista con severidad" (ícono + barra coloreada por umbral + marcador + score
  // alineado a la derecha + leyenda) en vez de la barra plana de un solo color de siempre.
  // Sin esto, se comporta exactamente igual que antes (retrocompatible).
  variant?: 'severity_list';
  // Ícono por fila (mismo orden que labels/values) — ver DEPARTMENT_ICONS en icons.ts.
  iconKeys?: string[];
  // Leyenda de severidad, renderizada como HTML debajo del gráfico (no en el canvas).
  legend?: HorizontalBarLegendItem[];
}

export interface DimensionScoreRow {
  // Clave de dimensión (ver DIMENSION_ICONS/DIMENSION_BADGE_BG en icons.ts) — resuelve el
  // ícono y el color de fondo de la insignia de esta fila.
  key: string;
  name: string;
  description?: string;
  value: number;
  severity?: 'success' | 'warning' | 'error';
  // Sin cobertura suficiente — la barra se muestra vacía (sin relleno ni marcador) y el
  // score se reemplaza por "Sin datos", igual que insufficient_data en el resto del reporte.
  insufficientData?: boolean;
}

export interface DimensionScoreLegendItem {
  label: string;
  color: string;
}

export interface DimensionScoreTableElement extends BaseElement {
  type: 'dimension_score_table';
  title?: string;
  subtitle?: string;
  rows: DimensionScoreRow[];
  // Escala del eje/barras (ej. 100). Default 100 si se omite.
  max?: number;
  // Umbral resaltado en el eje + posición de la línea punteada vertical sobre cada barra
  // (ej. 70, el corte de "Fortaleza"). Default 70 si se omite.
  threshold?: number;
  legend?: DimensionScoreLegendItem[];
}

export interface DepartmentTableColumn {
  // Clave de dimensión (ver DIMENSION_ICONS en icons.ts) — resuelve el ícono coloreado que
  // va sobre el texto del header de esta columna.
  key: string;
  label: string;
}

export interface DepartmentTableCell {
  // null => "—" (dimensión sin dato para este departamento, ej. no visible para el rol o
  // sin cobertura), distinto de insufficientData de la fila (que es el score agregado).
  value: number | null;
  severity?: 'success' | 'warning' | 'error';
}

export interface DepartmentTableRow {
  name: string;
  // Clave de departamento (ver DEPARTMENT_ICONS/departmentIconMonoDataUri en icons.ts,
  // best-effort por palabra clave).
  iconKey: string;
  headcount: number;
  score: number | null;
  scoreSeverity?: 'success' | 'warning' | 'error';
  insufficientData?: boolean;
  // Mismo orden que `dimensionColumns` del elemento padre.
  cells: DepartmentTableCell[];
}

export interface DepartmentTableElement extends BaseElement {
  type: 'department_table';
  title?: string;
  subtitle?: string;
  // Header de la columna de score agregado. Default "Score".
  scoreLabel?: string;
  dimensionColumns: DepartmentTableColumn[];
  rows: DepartmentTableRow[];
  // Umbral resaltado en la barra de escala inferior (ej. 70). Default 70 si se omite.
  threshold?: number;
  legend?: DimensionScoreLegendItem[];
}

export interface IndicatorRow {
  name: string;
  value: number;
  severity?: 'success' | 'warning' | 'error';
}

export interface IndicatorDimensionCard {
  // Clave de dimensión (ver DIMENSION_ICONS/DIMENSION_BADGE_BG en icons.ts).
  key: string;
  name: string;
  description?: string;
  score: number;
  severity?: 'success' | 'warning' | 'error';
  indicators: IndicatorRow[];
}

export interface IndicatorDimensionGridElement extends BaseElement {
  type: 'indicator_dimension_grid';
  title?: string;
  subtitle?: string;
  cards: IndicatorDimensionCard[];
  // Escala de scores/barras (ej. 100). Default 100 si se omite.
  max?: number;
  legend?: DimensionScoreLegendItem[];
  // Columnas de la grilla (1, 2 o 4 según cómo ajuste el contenido). Default 2.
  columns?: number;
}

export interface FindingCard {
  // Emoji tal cual lo manda calculateTopFindings() (backend) — se renderiza directo, sin
  // pasar por un registro de íconos (a diferencia de dimensiones/departamentos/alertas, un
  // finding no tiene una clave estable propia, solo el emoji).
  icon: string;
  leadNumber: string;
  leadUnit?: string;
  // Resto del título, con la palabra clave (si aplica) envuelta en **negrita** — se renderiza
  // con RichText (ya sabe parsear ese formato).
  titleRest: string;
  // Texto de impacto = la `description` real del finding (nunca texto inventado).
  impact: string;
  // Acción recomendada — no existe en el dato real (calculateTopFindings() no la expone),
  // se agrega en el backend desde un catálogo fijo de 4 entradas (uno por tipo de finding,
  // identificado por `icon`). Opcional por si algún finding no matchea el catálogo.
  action?: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface FindingsSectionElement extends BaseElement {
  type: 'findings_section';
  title?: string;
  subtitle?: string;
  cards: FindingCard[];
}

export interface AlertRow {
  // `tipo` de la alerta (ver ALERT_ICONS en icons.ts) — resuelve el ícono de la columna ALERTA.
  iconKey: string;
  title: string;
  description: string;
  department: string;
  // Clave de departamento (ver DEPARTMENT_ICONS/departmentIconMonoDataUri en icons.ts).
  departmentIconKey: string;
  riskLabel: string;
  // Segmentos llenos de la mini-barra RIESGO, de un total de `riskSegmentsTotal`.
  riskSegments: number;
  riskColor: string;
  // Acción recomendada real (accionSugerida en el backend) — antes se perdía por completo,
  // formatAlert() nunca la incluía en el reporte.
  action: string;
  level: string;
  levelColor: string;
}

export interface AlertsSectionElement extends BaseElement {
  type: 'alerts_section';
  title?: string;
  subtitle?: string;
  rows: AlertRow[];
  riskSegmentsTotal?: number;
}

export interface StackedBarDataPoint {
  label: string;
  values: { [key: string]: number };
}

export interface StackedBarElement extends BaseElement {
  type: 'stacked_bar';
  title: string;
  data: StackedBarDataPoint[];
}

export interface VelocimeterElement extends BaseElement {
  type: 'velocimeter';
  title: string;
  value: number;
  min: number;
  max: number;
}

export interface ScatterPlotPosition {
  label: string;
  x: number;
  y: number;
}

export interface ScatterPlotElement extends BaseElement {
  type: 'scatter_plot';
  title: string;
  x_axis: string;
  y_axis: string;
  positions: ScatterPlotPosition[];
}

export type PdfElement =
  | TextElement
  | CoverPageElement
  | PageBreakElement
  | HtmlElement
  | NumberedListElement
  | TableElement
  | DimensionScoreTableElement
  | DepartmentTableElement
  | IndicatorDimensionGridElement
  | FindingsSectionElement
  | AlertsSectionElement
  | MetricElement
  | BarChartElement
  | PieChartElement
  | RadarChartElement
  | DoughnutChartElement
  | HorizontalBarElement
  | StackedBarElement
  | VelocimeterElement
  | ScatterPlotElement
  | BulletPointsElement;
