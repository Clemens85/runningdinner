export type ExcelImportRowStatus = 'VALID' | 'INFO' | 'WARNING' | 'ERROR';

export interface ExcelImportValidationMessage {
  /** Which field this message belongs to, or null for row-level messages */
  field: keyof ExcelImportRowData | null;
  /** Human-readable message */
  message: string;
  /** Severity of this individual message — INFO does not affect row status */
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

/** Raw flat fields parsed from a single Excel row — all strings before type coercion */
export interface ExcelImportRowData {
  // Mandatory (columns A-G: 0-6)
  firstnamePart: string;
  lastname: string;
  email: string;
  street: string;
  streetNr: string;
  zip: string;
  cityName: string;
  // Optional
  gender: string; // 'm' | 'w' | ''
  age: string; // numeric string or ''
  numSeats: string; // numeric string or ''
  mobileNumber: string;
  addressRemarks: string;
  notes: string;
  vegetarian: string; // 'ja' | 'yes' | '1' | ''
  vegan: string;
  lactose: string;
  gluten: string;
  mealSpecificsNote: string;
  // Option 1: Team partner wish by invitation email — points to an existing or incoming participant
  teamPartnerWishEmail: string;
  // Option 2: Fixed team partner registration — the partner is co-registered with minimal data
  teamPartnerWishPartnerFirstname: string;
  teamPartnerWishPartnerLastname: string;
  teamPartnerWishPartnerEmail: string; // partner's own email (optional, used for their registration)
  teamPartnerWishPartnerMobileNumber: string; // partner's mobile (optional)
}

export type SingleRowValidationResult = {
  messages: ExcelImportValidationMessage[];
  status: ExcelImportRowStatus;
};

/** A parsed + validated row ready for preview display */
export interface ExcelImportRow {
  /** 1-based row number in the Excel file (for user display, accounting for header) */
  rowNumber: number;
  data: ExcelImportRowData;
  validationResult: SingleRowValidationResult;
  /**
   * Set when the row's email matches an existing (non-child) participant.
   * The row is still marked as ERROR by default, but it can be opted into an update
   * via the "update existing" checkbox — provided no other errors are present.
   */
  existingParticipantId?: string;
}

/** Aggregate shown to the organizer before confirmation */
export interface ImportPreview {
  rows: ExcelImportRow[];
  counts: {
    total: number;
    valid: number;
    infos: number;
    warnings: number;
    errors: number;
  };
}

export interface ImportResult {
  succeededCount: number;
  failedRows: Array<{ row: ExcelImportRow; error: string }>;
}
