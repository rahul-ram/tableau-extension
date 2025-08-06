export interface ReportParams {
  [key: string]: string | number | Date;
}

export interface ReportParameter {
  param_name: string;
  data_type: 'string' | 'number' | 'float' | 'date';
}

export interface ReportStatus {
  timestamp: string;
  isStale: boolean;
}

// Type mapping for data types
export const DATA_TYPE_MAP = {
  string: 'text',
  number: 'number',
  float: 'number',
  date: 'date'
} as const;