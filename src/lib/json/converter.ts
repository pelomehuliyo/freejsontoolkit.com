/**
 * JSON Converter Utilities
 * Real offline processing implementation.
 */

export interface ConversionOptions {
  delimiter?: ',' | ';' | '\t';
  flatten?: boolean;
  includeHeaders?: boolean;
}

/**
 * Flattens a nested JSON object into a single-level object.
 * Paths are generated using dot notation (e.g. user.profile.name or tags.0).
 */
export function flattenJson(obj: any, prefix = '', res: any = {}): any {
  if (obj === null || obj === undefined) {
    if (prefix) {
      res[prefix] = '';
    }
    return res;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      if (prefix) {
        res[prefix] = '';
      }
    } else {
      for (let i = 0; i < obj.length; i++) {
        const val = obj[i];
        const propName = prefix ? `${prefix}.${i}` : `${i}`;
        if (val !== null && typeof val === 'object') {
          flattenJson(val, propName, res);
        } else {
          res[propName] = val;
        }
      }
    }
  } else if (typeof obj === 'object') {
    // Handle standard objects
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      if (prefix) {
        res[prefix] = '';
      }
    } else {
      for (const key of keys) {
        const val = obj[key];
        const propName = prefix ? `${prefix}.${key}` : key;
        if (val !== null && typeof val === 'object') {
          flattenJson(val, propName, res);
        } else {
          res[propName] = val;
        }
      }
    }
  } else {
    // Handle primitives passed directly
    if (prefix) {
      res[prefix] = obj;
    }
  }

  return res;
}

/**
 * Escapes a cell value according to RFC 4180.
 * Wraps cells in double quotes if they contain quotes, newlines, or delimiters.
 */
function escapeCsvCell(val: any, delimiter: string): string {
  if (val === null || val === undefined) {
    return '';
  }
  
  const str = String(val);
  const needsEscaping = str.includes(delimiter) || 
                        str.includes('"') || 
                        str.includes('\n') || 
                        str.includes('\r');
                        
  if (needsEscaping) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Converts raw JSON text into a CSV output string.
 * Validates, standardizes, flattens, and formats according to options.
 */
export function jsonToCsv(jsonStr: string, options: ConversionOptions = {}): string {
  const input = jsonStr.trim();
  if (!input) {
    return '';
  }

  let parsed: any;
  try {
    parsed = JSON.parse(input);
  } catch (err: any) {
    throw new Error(`Invalid JSON syntax: ${err.message}`);
  }

  // Standardize input: wrap objects/primitives in an array
  let itemsToProcess: any[] = [];
  if (Array.isArray(parsed)) {
    itemsToProcess = parsed;
  } else {
    itemsToProcess = [parsed];
  }

  // Process all items (flatten if requested, otherwise stringify nested objects)
  const processedItems = itemsToProcess.map(item => {
    if (options.flatten !== false) {
      // If primitive, wrap it
      if (item === null || typeof item !== 'object') {
        return { value: item };
      }
      return flattenJson(item);
    } else {
      if (item === null || typeof item !== 'object') {
        return { value: item };
      }
      const result: any = {};
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const val = item[key];
          if (val !== null && typeof val === 'object') {
            result[key] = JSON.stringify(val);
          } else {
            result[key] = val;
          }
        }
      }
      return result;
    }
  });

  // Extract all unique headers across all records to align columns
  const headerMap: { [key: string]: boolean } = {};
  for (const item of processedItems) {
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        headerMap[key] = true;
      }
    }
  }
  const headers = Object.keys(headerMap);

  if (headers.length === 0) {
    return '';
  }

  const delimiter = options.delimiter || ',';
  const csvRows: string[] = [];

  // 1. Add headers row if requested
  if (options.includeHeaders !== false) {
    const escapedHeaders = headers.map(header => escapeCsvCell(header, delimiter));
    csvRows.push(escapedHeaders.join(delimiter));
  }

  // 2. Add data rows
  for (const item of processedItems) {
    const row = headers.map(header => {
      const val = item[header];
      return escapeCsvCell(val, delimiter);
    });
    csvRows.push(row.join(delimiter));
  }

  return csvRows.join('\r\n');
}
