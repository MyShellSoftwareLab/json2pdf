import {
  PdfElement,
  TableElement,
  MetricElement,
  BarChartElement,
  PieChartElement,
  RadarChartElement,
  DoughnutChartElement,
  HorizontalBarElement,
  StackedBarElement,
  LineChartElement,
  VelocimeterElement,
  ScatterPlotElement,
  RichContent
} from '../types';


export interface ValidationError {
  errors: string[];
  element: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Mismo formato de longitudes que `options` (ver pdfOptions.ts), más porcentajes, que son lo
// natural para repartir el ancho de una tabla.
const COLUMN_WIDTH = /^\d+(?:\.\d+)?\s*(%|px|in|cm|mm)?$/i;

const isValidColumnWidth = (width: unknown): boolean =>
  (typeof width === 'number' && Number.isFinite(width) && width > 0) ||
  (typeof width === 'string' && COLUMN_WIDTH.test(width.trim()) && parseFloat(width) > 0);

const isValidRichContent = (item: any): boolean => {
  if (item === null) return true;
  if (typeof item === 'string' || typeof item === 'number' || typeof item === null) return true;
  if (typeof item === 'object' && item !== null) {
    if (item.type === 'progress') {
      return typeof item.value === 'number';
    }
    if (typeof item.text === 'string' || typeof item.text === 'number' || typeof item.text === null) return true;
  }
  return false;
};

export const validateElements = (elements: any[]): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!Array.isArray(elements)) {
    // For top-level errors where we don't have a specific element
    return {
      isValid: false,
      errors: [{ errors: ['Input must be an array of elements.'], element: null }]
    };
  }

  elements.forEach((element, index) => {
    const elementErrors: string[] = [];
    const errorPrefix = `Element ${index}`;

    if (!element.type) {
      elementErrors.push(`${errorPrefix}: Missing 'type' property.`);
      errors.push({ errors: elementErrors, element });
      return;
    }

    const type = element.type;

    switch (type) {
      case 'title':
      case 'subtitle':
      case 'paragraph':
        if (typeof element.content !== 'string' && !isValidRichContent(element.content)) {
          elementErrors.push(`${errorPrefix} (${type}): 'content' must be a string or object with 'text'.`);
        }
        break;

      case 'cover_page':
        if (!element.title) elementErrors.push(`${errorPrefix} (${type}): Missing 'title'.`);
        break;

      case 'numbered_list':
        if (!Array.isArray(element.items)) {
          elementErrors.push(`${errorPrefix} (${type}): 'items' must be an array.`);
        } else {
          element.items.forEach((item: any, i: number) => {
            if (!isValidRichContent(item)) {
              elementErrors.push(`${errorPrefix} (${type}): Item ${i} is malformed.`);
            }
          });
        }
        break;

      case 'table':
        const table = element as TableElement;
        if (!Array.isArray(table.headers)) {
          elementErrors.push(`${errorPrefix} (${type}): 'headers' must be an array.`);
        }
        if (table.column_widths !== undefined) {
          if (!Array.isArray(table.column_widths)) {
            elementErrors.push(`${errorPrefix} (${type}): 'column_widths' must be an array.`);
          } else {
            if (Array.isArray(table.headers) && table.column_widths.length !== table.headers.length) {
              elementErrors.push(`${errorPrefix} (${type}): 'column_widths' has ${table.column_widths.length} values but 'headers' has ${table.headers.length}.`);
            }
            table.column_widths.forEach((width, widthIndex) => {
              if (!isValidColumnWidth(width)) {
                elementErrors.push(`${errorPrefix} (${type}): column_widths[${widthIndex}] must be a percentage ("50%"), a length ("120px", "30mm") or a number of pixels.`);
              }
            });
          }
        }
        if (!Array.isArray(table.rows)) {
          elementErrors.push(`${errorPrefix} (${type}): 'rows' must be an array.`);
        } else {
          table.rows.forEach((row, rowIndex) => {
            if (!Array.isArray(row)) {
              elementErrors.push(`${errorPrefix} (${type}): Row ${rowIndex} must be an array.`);
            } else {
              row.forEach((cell, cellIndex) => {
                if (!isValidRichContent(cell)) {
                  elementErrors.push(`${errorPrefix} (${type}): Row ${rowIndex}, Cell ${cellIndex} is malformed.`);
                }
              });
            }
          });
        }
        break;

      case 'metric':
        const metric = element as MetricElement;
        if (!metric.title) elementErrors.push(`${errorPrefix} (${type}): Missing 'title'.`);
        // Value can be string, number or rich content object (though usually just string/number, user asked for flexibility)
        if (metric.value === undefined || metric.value === null) {
          elementErrors.push(`${errorPrefix} (${type}): Missing 'value'.`);
        } else if (!isValidRichContent(metric.value)) {
          elementErrors.push(`${errorPrefix} (${type}): 'value' is malformed.`);
        }
        break;

      case 'bar_chart':
      case 'pie_chart':
        const simpleChart = element as BarChartElement | PieChartElement;
        if (!simpleChart.title) elementErrors.push(`${errorPrefix} (${type}): Missing 'title'.`);
        if (!Array.isArray(simpleChart.data)) {
          elementErrors.push(`${errorPrefix} (${type}): 'data' must be an array.`);
        } else {
          simpleChart.data.forEach((d, i) => {
            if (!d.label || d.value === undefined) {
              elementErrors.push(`${errorPrefix} (${type}): Data item ${i} is missing 'label' or 'value'.`);
            }
          });
        }
        break;

      case 'radar_chart':
      case 'doughnut_chart':
      case 'horizontal_bar':
        const labelValueChart = element as RadarChartElement | DoughnutChartElement | HorizontalBarElement;
        if (!labelValueChart.title) elementErrors.push(`${errorPrefix} (${type}): Missing 'title'.`);
        if (!Array.isArray(labelValueChart.labels)) elementErrors.push(`${errorPrefix} (${type}): 'labels' must be an array.`);
        if (!Array.isArray(labelValueChart.values)) elementErrors.push(`${errorPrefix} (${type}): 'values' must be an array.`);
        if (Array.isArray(labelValueChart.labels) && Array.isArray(labelValueChart.values) && labelValueChart.labels.length !== labelValueChart.values.length) {
          elementErrors.push(`${errorPrefix} (${type}): 'labels' and 'values' arrays must have the same length.`);
        }
        break;

      case 'stacked_bar':
        const stackedBar = element as StackedBarElement;
        if (!stackedBar.title) elementErrors.push(`${errorPrefix} (${type}): Missing 'title'.`);
        if (!Array.isArray(stackedBar.data)) {
          elementErrors.push(`${errorPrefix} (${type}): 'data' must be an array.`);
        } else {
          stackedBar.data.forEach((d, i) => {
            if (!d.label || !d.values || typeof d.values !== 'object') {
              elementErrors.push(`${errorPrefix} (${type}): Data item ${i} is malformed (needs 'label' and 'values' object).`);
            }
          });
        }
        break;

      case 'line_chart': {
        const line = element as LineChartElement;
        const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
        if (!line.title) elementErrors.push(`${errorPrefix} (${type}): Missing 'title'.`);

        const labelsOk = Array.isArray(line.labels) && line.labels.length > 0;
        if (!labelsOk) elementErrors.push(`${errorPrefix} (${type}): 'labels' must be a non-empty array.`);

        if (!Array.isArray(line.series) || line.series.length === 0) {
          elementErrors.push(`${errorPrefix} (${type}): 'series' must be a non-empty array.`);
        } else {
          line.series.forEach((s, i) => {
            const name = `Series ${i}${typeof s?.name === 'string' ? ` ('${s.name}')` : ''}`;
            if (!s || typeof s.name !== 'string' || !s.name) elementErrors.push(`${errorPrefix} (${type}): ${name} is missing 'name'.`);
            if (!Array.isArray(s?.values)) {
              elementErrors.push(`${errorPrefix} (${type}): ${name} 'values' must be an array.`);
              return;
            }
            if (labelsOk && s.values.length !== line.labels.length) {
              elementErrors.push(`${errorPrefix} (${type}): ${name} has ${s.values.length} values but 'labels' has ${line.labels.length}.`);
            }
            const badIndex = s.values.findIndex((v) => v !== null && !isNum(v));
            if (badIndex !== -1) elementErrors.push(`${errorPrefix} (${type}): ${name} value ${badIndex} must be a number or null.`);
            if (s.color !== undefined && typeof s.color !== 'string') elementErrors.push(`${errorPrefix} (${type}): ${name} 'color' must be a string.`);
            if (s.dashed !== undefined && typeof s.dashed !== 'boolean') elementErrors.push(`${errorPrefix} (${type}): ${name} 'dashed' must be a boolean.`);
          });
        }

        if (line.y_axis !== undefined) {
          const y = line.y_axis;
          if (typeof y !== 'object' || y === null) {
            elementErrors.push(`${errorPrefix} (${type}): 'y_axis' must be an object.`);
          } else {
            if (y.min !== undefined && !isNum(y.min)) elementErrors.push(`${errorPrefix} (${type}): 'y_axis.min' must be a number.`);
            if (y.max !== undefined && !isNum(y.max)) elementErrors.push(`${errorPrefix} (${type}): 'y_axis.max' must be a number.`);
            if (isNum(y.min) && isNum(y.max) && (y.min as number) >= (y.max as number)) elementErrors.push(`${errorPrefix} (${type}): 'y_axis.min' must be lower than 'y_axis.max'.`);
            if (y.label !== undefined && typeof y.label !== 'string') elementErrors.push(`${errorPrefix} (${type}): 'y_axis.label' must be a string.`);
          }
        }

        if (line.bands !== undefined) {
          if (!Array.isArray(line.bands)) {
            elementErrors.push(`${errorPrefix} (${type}): 'bands' must be an array.`);
          } else {
            line.bands.forEach((b, i) => {
              if (!b || !isNum(b.from) || !isNum(b.to)) elementErrors.push(`${errorPrefix} (${type}): Band ${i} needs numeric 'from' and 'to'.`);
              else if (b.from >= b.to) elementErrors.push(`${errorPrefix} (${type}): Band ${i} 'from' must be lower than 'to'.`);
              if (b?.color !== undefined && typeof b.color !== 'string') elementErrors.push(`${errorPrefix} (${type}): Band ${i} 'color' must be a string.`);
              if (b?.label !== undefined && typeof b.label !== 'string') elementErrors.push(`${errorPrefix} (${type}): Band ${i} 'label' must be a string.`);
            });
          }
        }
        break;
      }

      case 'velocimeter':
        const velocimeter = element as VelocimeterElement;
        if (!velocimeter.title) elementErrors.push(`${errorPrefix} (${type}): Missing 'title'.`);
        if (velocimeter.value === undefined) elementErrors.push(`${errorPrefix} (${type}): Missing 'value'.`);
        if (velocimeter.min === undefined) elementErrors.push(`${errorPrefix} (${type}): Missing 'min'.`);
        if (velocimeter.max === undefined) elementErrors.push(`${errorPrefix} (${type}): Missing 'max'.`);
        break;

      case 'scatter_plot':
        const scatter = element as ScatterPlotElement;
        if (!scatter.title) elementErrors.push(`${errorPrefix} (${type}): Missing 'title'.`);
        if (!Array.isArray(scatter.positions)) {
          elementErrors.push(`${errorPrefix} (${type}): 'positions' must be an array.`);
        } else {
          scatter.positions.forEach((p, i) => {
            if (!p.label || p.x === undefined || p.y === undefined) {
              elementErrors.push(`${errorPrefix} (${type}): Position item ${i} is malformed (needs 'label', 'x', 'y').`);
            }
          });
        }
        break;

      case 'html':
        if (typeof element.content !== 'string' || !element.content.trim()) {
          elementErrors.push(`${errorPrefix} (${type}): 'content' must be a non-empty HTML string.`);
        }
        break;

      case 'page_break':
        // Sin propiedades requeridas.
        break;

      default:
        // Optional: warn about unknown types or ignore
        // elementErrors.push(`${errorPrefix}: Unknown element type '${type}'.`);
        break;
    }

    if (elementErrors.length > 0) {
      errors.push({
        errors: elementErrors,
        element: element
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

