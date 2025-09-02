/**
 * Google Sheets API response interfaces
 */

export interface GoogleSheetsApiResponse {
  result: {
    values?: string[][];
    majorDimension?: string;
    range?: string;
  };
  status: number;
}

export interface GoogleSheetsUpdateResponse {
  status: number;
  updatedCells?: number;
  updatedColumns?: number;
  updatedData?: {
    values?: string[][];
  };
  updatedRange?: string;
  updatedRows?: number;
}

export interface GoogleSheetsAppendResponse {
  status: number;
  spreadsheetId?: string;
  tableRange?: string;
  updates?: {
    spreadsheetId?: string;
    updatedCells?: number;
    updatedColumns?: number;
    updatedData?: {
      values?: string[][];
    };
    updatedRange?: string;
    updatedRows?: number;
  };
}
