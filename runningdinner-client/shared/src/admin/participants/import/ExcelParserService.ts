import { ExcelImportRowData } from './types';

export const ALLOWED_IMPORT_FILE_EXTENSIONS = ['.xlsx', '.xls'];

type Accept = {
  [key: string]: string[];
};

export const ALLOWED_IMPORT_FILE_TYPES: Accept = {
  'application/vnd.ms-excel': ALLOWED_IMPORT_FILE_EXTENSIONS,
  'application/msexcel': ALLOWED_IMPORT_FILE_EXTENSIONS,
  'application/x-msexcel': ALLOWED_IMPORT_FILE_EXTENSIONS,
  'application/x-ms-excel': ALLOWED_IMPORT_FILE_EXTENSIONS,
  'application/x-excel': ALLOWED_IMPORT_FILE_EXTENSIONS,
  'application/xls': ALLOWED_IMPORT_FILE_EXTENSIONS,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [ALLOWED_IMPORT_FILE_EXTENSIONS[0]],
};

export function getAllowedImportFileTypesAcceptString(): string {
  const mimeTypes = Object.keys(ALLOWED_IMPORT_FILE_TYPES);
  return mimeTypes.join(', ');
}

export function isFileExtensionAllowed(file: File): boolean {
  const fileName = (file.name || '').toLowerCase();
  for (const name of ALLOWED_IMPORT_FILE_EXTENSIONS) {
    if (fileName.endsWith(name)) {
      return true;
    }
  }
  return false;
}

/** Fixed column index → ExcelImportRowData field mapping (0-based, matches data-model.md) */
const COL_MAP: Array<keyof ExcelImportRowData> = [
  'firstnamePart', // 0  A  Vorname
  'lastname', // 1  B  Nachname
  'email', // 2  C  E-Mail-Adresse
  'gender', // 3  D  Geschlecht
  'age', // 4  E  Alter
  'street', // 5  F  Straße
  'streetNr', // 6  G  Hausnummer
  'zip', // 7  H  PLZ
  'cityName', // 8  I  Stadt
  'addressRemarks', // 9  J  Adresszusatz
  'numSeats', // 10 K  Anzahl Sitzplätze
  'mobileNumber', // 11 L  Handy-Nr
  'vegetarian', // 12 M  Vegetarisch
  'vegan', // 13 N  Vegan
  'lactose', // 14 O  Laktosefrei
  'gluten', // 15 P  Glutenfrei
  'mealSpecificsNote', // 16 Q  Essenswünsche (Notiz)
  'notes', // 17 R  Sonstige Anmerkungen
  'teamPartnerWishEmail', // 18 S  Teamwunsch E-Mail
  'teamPartnerWishPartnerFirstname', // 19 T  Teamwunsch Vorname
  'teamPartnerWishPartnerLastname', // 20 U  Teamwunsch Nachname
];

/** Template column headers (German) in fixed order */
const TEMPLATE_HEADERS = [
  'Vorname',
  'Nachname',
  'E-Mail-Adresse',
  'Geschlecht',
  'Alter',
  'Straße',
  'Hausnummer',
  'PLZ',
  'Stadt',
  'Adresszusatz',
  'Anzahl Sitzplätze',
  'Handy-Nr',
  'Vegetarisch',
  'Vegan',
  'Laktosefrei',
  'Glutenfrei',
  'Essenswünsche (Notiz)',
  'Sonstige Anmerkungen',
  'Teamwunsch E-Mail',
  'Teamwunsch Vorname',
  'Teamwunsch Nachname',
];

const TEMPLATE_INSTRUCTIONS: Array<[string, string, string, string]> = [
  ['Vorname', 'firstnamePart', 'Ja', 'Beliebiger Text'],
  ['Nachname', 'lastname', 'Ja', 'Beliebiger Text'],
  ['E-Mail-Adresse', 'email', 'Ja', 'Gültige E-Mail-Adresse, muss eindeutig sein'],
  ['Geschlecht', 'gender', 'Nein', 'm = männlich, w = weiblich, oder leer lassen falls divers oder keine Angabe'],
  ['Alter', 'age', 'Nein', 'Positive ganze Zahl oder leer lassen'],
  ['Straße', 'street', 'Ja', 'Straßenname ohne Hausnummer'],
  ['Hausnummer', 'streetNr', 'Ja', 'Hausnummer (z.B. 12 oder 12a)'],
  ['PLZ', 'zip', 'Ja', 'Postleitzahl'],
  ['Stadt', 'cityName', 'Ja', 'Stadtname'],
  ['Adresszusatz', 'addressRemarks', 'Nein', 'Optionale Adressdetails (z.B. Etage, Wohnungsnr.)'],
  ['Anzahl Sitzplätze', 'numSeats', 'Nein', 'Nicht-negative ganze Zahl oder leer lassen'],
  ['Handy-Nr', 'mobileNumber', 'Nein', 'Handynummer als Text'],
  ['Vegetarisch', 'vegetarian', 'Nein', 'ja / yes / 1 = vegetarisch; sonst leer lassen'],
  ['Vegan', 'vegan', 'Nein', 'ja / yes / 1 = vegan; sonst leer lassen'],
  ['Laktosefrei', 'lactose', 'Nein', 'ja / yes / 1 = laktosefrei; sonst leer lassen'],
  ['Glutenfrei', 'gluten', 'Nein', 'ja / yes / 1 = glutenfrei; sonst leer lassen'],
  ['Essenswünsche (Notiz)', 'mealSpecificsNote', 'Nein', 'Freitext für weitere Essenswünsche'],
  ['Sonstige Anmerkungen', 'notes', 'Nein', 'Weitere Hinweise zum Teilnehmer'],
  ['Teamwunsch E-Mail', 'teamPartnerWishEmail', 'Nein', 'E-Mail des gewünschten Team-Partners (hat Vorrang vor Vorname/Nachname)'],
  ['Teamwunsch Vorname', 'teamPartnerWishPartnerFirstname', 'Nein', 'Vorname des Team-Partners (nur wenn keine E-Mail angegeben)'],
  ['Teamwunsch Nachname', 'teamPartnerWishPartnerLastname', 'Nein', 'Nachname des Team-Partners (nur wenn keine E-Mail angegeben)'],
];

function getCellString(row: unknown[], index: number): string {
  const val = row[index];
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function mapRowToImportData(row: unknown[]): ExcelImportRowData {
  const result: Partial<ExcelImportRowData> = {};
  for (let i = 0; i < COL_MAP.length; i++) {
    const field = COL_MAP[i];
    (result as Record<string, string>)[field] = getCellString(row, i);
  }
  return result as ExcelImportRowData;
}

export class ImportError extends Error {
  constructor(
    message: string,
    public readonly code: 'NO_DATA_ROWS' | 'INVALID_FILE',
  ) {
    super(message);
    this.name = 'ImportError';
  }
}

/**
 * Parses an .xlsx file client-side using lazy-loaded SheetJS.
 * Skips the header row (index 0) and returns raw string data rows.
 */
export async function parseExcelFile(file: File): Promise<ExcelImportRowData[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  // raw[0] is header row — skip it
  const dataRows = raw.slice(1).filter((row) => {
    // Filter out completely empty rows
    return (row as unknown[]).some((cell) => cell !== '' && cell !== null && cell !== undefined);
  });

  if (dataRows.length === 0) {
    throw new ImportError('The Excel file contains no data rows.', 'NO_DATA_ROWS');
  }

  return dataRows.map(mapRowToImportData);
}

/**
 * Generates and downloads a two-sheet Excel template:
 * - "Vorlage": header row only, all 21 columns
 * - "Hinweise": one row per column explaining field, mandatory status, accepted values
 */
export async function generateImportTemplate(): Promise<void> {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  // Sheet 1: Vorlage (header row only)
  const vorlageSheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  XLSX.utils.book_append_sheet(wb, vorlageSheet, 'Vorlage');

  // Sheet 2: Hinweise (instructions)
  const instructionRows: string[][] = [
    ['Spalte', 'Feldname', 'Pflichtfeld', 'Beschreibung / Erlaubte Werte'],
    ...TEMPLATE_INSTRUCTIONS.map(([col, field, mandatory, desc]) => [col, field, mandatory, desc]),
  ];
  const hinweiseSheet = XLSX.utils.aoa_to_sheet(instructionRows);
  XLSX.utils.book_append_sheet(wb, hinweiseSheet, 'Hinweise');

  XLSX.writeFile(wb, 'teilnehmer-vorlage.xlsx');
}
