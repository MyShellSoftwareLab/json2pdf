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

