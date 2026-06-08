import { Participant } from '../../../types';
import { ExcelImportRow, ExcelImportRowData, ExcelImportRowStatus, ExcelImportValidationMessage } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_GENDER_VALUES = new Set(['m', 'w', '', 'männlich', 'weiblich', 'male', 'female']);

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function worseStatus(a: ExcelImportRowStatus, b: ExcelImportRowStatus): ExcelImportRowStatus {
  if (a === 'ERROR' || b === 'ERROR') return 'ERROR';
  if (a === 'WARNING' || b === 'WARNING') return 'WARNING';
  return 'VALID';
}

function err(field: keyof ExcelImportRowData | null, message: string): ExcelImportValidationMessage {
  return { field, message };
}

function warn(field: keyof ExcelImportRowData | null, message: string): ExcelImportValidationMessage {
  return { field, message };
}

interface ValidationContext {
  inFileEmails: Map<string, number>; // email → first row number that has it
  existingEmails: Set<string>;
}

function validateSingleRow(data: ExcelImportRowData, rowNumber: number, ctx: ValidationContext): { messages: ExcelImportValidationMessage[]; status: ExcelImportRowStatus } {
  const messages: ExcelImportValidationMessage[] = [];
  let status: ExcelImportRowStatus = 'VALID';

  const addErr = (field: keyof ExcelImportRowData | null, message: string) => {
    messages.push(err(field, message));
    status = worseStatus(status, 'ERROR');
  };

  const addWarn = (field: keyof ExcelImportRowData | null, message: string) => {
    messages.push(warn(field, message));
    status = worseStatus(status, 'WARNING');
  };

  // --- Mandatory string fields ---
  const mandatoryFields: Array<{ field: keyof ExcelImportRowData; label: string }> = [
    { field: 'firstnamePart', label: 'Vorname' },
    { field: 'lastname', label: 'Nachname' },
    { field: 'email', label: 'E-Mail' },
    { field: 'street', label: 'Straße' },
    { field: 'streetNr', label: 'Hausnummer' },
    { field: 'zip', label: 'PLZ' },
    { field: 'cityName', label: 'Stadt' },
  ];

  for (const { field, label } of mandatoryFields) {
    if ((data[field] as string).trim() === '') {
      addErr(field, `Pflichtfeld fehlt: ${label}`);
    }
  }

  // --- Email format ---
  const emailNorm = data.email.trim().toLowerCase();
  if (emailNorm !== '' && !isValidEmail(emailNorm)) {
    addErr('email', 'Ungültige E-Mail-Adresse');
  }

  // --- Duplicate in file ---
  if (emailNorm !== '' && isValidEmail(emailNorm)) {
    const firstSeen = ctx.inFileEmails.get(emailNorm);
    if (firstSeen === undefined) {
      ctx.inFileEmails.set(emailNorm, rowNumber);
    } else if (firstSeen !== rowNumber) {
      addErr('email', `E-Mail doppelt in der Datei (zuerst in Zeile ${firstSeen})`);
    }
  }

  // --- Duplicate against existing participants ---
  if (emailNorm !== '' && ctx.existingEmails.has(emailNorm)) {
    addErr('email', 'E-Mail bereits registriert');
  }

  // --- Gender ---
  const genderRaw = data.gender.trim().toLowerCase();
  if (genderRaw !== '' && !VALID_GENDER_VALUES.has(genderRaw)) {
    addWarn('gender', 'Ungültiger Geschlechtswert (erwartet: m, w, divers)');
  }

  // --- numSeats ---
  const numSeatsRaw = data.numSeats.trim();
  if (numSeatsRaw !== '') {
    const parsed = parseInt(numSeatsRaw, 10);
    if (!Number.isFinite(parsed) || parsed < 0 || String(parsed) !== numSeatsRaw) {
      addWarn('numSeats', 'Ungültige Anzahl Sitzplätze (muss eine nicht-negative ganze Zahl sein)');
    }
  }

  // --- age ---
  const ageRaw = data.age.trim();
  if (ageRaw !== '') {
    const parsed = parseInt(ageRaw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0 || String(parsed) !== ageRaw) {
      addWarn('age', 'Ungültiges Alter (muss eine positive ganze Zahl sein)');
    }
  }

  // --- Team partner wish: email ---
  const wishEmail = data.teamPartnerWishEmail.trim().toLowerCase();
  if (wishEmail !== '') {
    if (!isValidEmail(wishEmail)) {
      addErr('teamPartnerWishEmail', 'Ungültige Teamwunsch-E-Mail');
    } else if (wishEmail === emailNorm) {
      addErr('teamPartnerWishEmail', 'Teamwunsch-E-Mail darf nicht die eigene E-Mail sein');
    }
    // "partner not found" is checked in a second pass (all rows needed)
  }

  return { messages, status };
}

/**
 * Validates all rows in two passes:
 * 1. Per-row structural checks (mandatory fields, format, intra-file duplicates, existing dupes)
 * 2. Cross-row check: team partner email wish → partner exists in file or among existing participants
 */
export function validateImportRows(rows: ExcelImportRowData[], existingParticipants: Participant[]): ExcelImportRow[] {
  const existingEmails = new Set(existingParticipants.map((p) => p.email.trim().toLowerCase()));
  const inFileEmails = new Map<string, number>();

  // First pass: pre-collect all valid emails so duplicate detection is correct
  // We collect them first then iterate again with validation to detect cross-references
  for (let i = 0; i < rows.length; i++) {
    const emailNorm = rows[i].email.trim().toLowerCase();
    if (emailNorm !== '' && isValidEmail(emailNorm)) {
      if (!inFileEmails.has(emailNorm)) {
        inFileEmails.set(emailNorm, i + 1); // 1-based row number
      }
    }
  }

  const ctx: ValidationContext = { inFileEmails: new Map(), existingEmails };

  // Rebuild inFileEmails for duplicate detection pass (we need it fresh for error messages)
  const finalEmailFirstSeen = new Map<string, number>(inFileEmails);
  ctx.inFileEmails = new Map();

  const validatedRows: ExcelImportRow[] = rows.map((data, index) => {
    const rowNumber = index + 1; // 1-based

    const { messages, status } = validateSingleRow(data, rowNumber, ctx);

    return {
      rowNumber,
      data,
      status,
      validationMessages: messages,
    };
  });

  // Second pass: check team partner email references
  for (const row of validatedRows) {
    const wishEmail = row.data.teamPartnerWishEmail.trim().toLowerCase();
    if (wishEmail !== '' && wishEmail !== row.data.email.trim().toLowerCase()) {
      const foundInFile = finalEmailFirstSeen.has(wishEmail);
      const foundInExisting = existingEmails.has(wishEmail);
      if (!foundInFile && !foundInExisting) {
        row.validationMessages.push(warn('teamPartnerWishEmail', 'Teamwunsch-E-Mail nicht gefunden'));
        if (row.status === 'VALID') {
          row.status = 'WARNING';
        }
      }
    }
  }

  return validatedRows;
}
