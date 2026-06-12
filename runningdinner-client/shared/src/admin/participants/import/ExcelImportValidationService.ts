import { Participant } from '../../../types';
import { isStringNotEmpty } from '../../../Utils.ts';
import { ExcelImportRow, ExcelImportRowData, ExcelImportRowStatus, ExcelImportValidationMessage, SingleRowValidationResult } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_GENDER_VALUES = new Set(['m', 'w', '', 'männlich', 'weiblich', 'male', 'female']);

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function worseStatus(a: ExcelImportRowStatus, b: ExcelImportRowStatus): ExcelImportRowStatus {
  if (a === 'ERROR' || b === 'ERROR') return 'ERROR';
  if (a === 'WARNING' || b === 'WARNING') return 'WARNING';
  if (a === 'INFO' || b === 'INFO') return 'INFO';
  return 'VALID';
}

function err(field: keyof ExcelImportRowData | null, message: string): ExcelImportValidationMessage {
  return { field, message, severity: 'ERROR' };
}

function warn(field: keyof ExcelImportRowData | null, message: string): ExcelImportValidationMessage {
  return { field, message, severity: 'WARNING' };
}

function info(field: keyof ExcelImportRowData | null, message: string): ExcelImportValidationMessage {
  return { field, message, severity: 'INFO' };
}

function getNormalizedEmail(email: string) {
  return email.trim().toLowerCase();
}

function isSameEmail(a: string, b: string) {
  return isStringNotEmpty(a) && isStringNotEmpty(b) && getNormalizedEmail(a) === getNormalizedEmail(b);
}

function hasValidTeamPartnerWishEmail(row: ExcelImportRowData) {
  return isStringNotEmpty(row.teamPartnerWishEmail) && !isSameEmail(row.teamPartnerWishEmail, row.email);
}

interface ValidationContext {
  incomingEmailsByRowNumber: Map<string, number>; // email → first row number that has it
  existingEmails: Set<string>;
  existingTeamPartnerWishEmails: Set<string>;
}

// --- Mandatory string fields ---
const MANDATORY_FIELDS: Array<{ field: keyof ExcelImportRowData; label: string }> = [
  { field: 'firstnamePart', label: 'Vorname' },
  { field: 'lastname', label: 'Nachname' },
  { field: 'email', label: 'E-Mail' },
  { field: 'street', label: 'Straße' },
  { field: 'streetNr', label: 'Hausnummer' },
  { field: 'zip', label: 'PLZ' },
  { field: 'cityName', label: 'Stadt' },
];

export class ExcelImportValidationService {
  private ctx: ValidationContext;

  constructor(existingParticipants: Participant[]) {
    const existingEmails = new Set(existingParticipants.map((p) => getNormalizedEmail(p.email)));
    const existingTeamPartnerWishEmails = new Set(
      existingParticipants.filter((p) => isStringNotEmpty(p.teamPartnerWishEmail)).map((p) => getNormalizedEmail(p.teamPartnerWishEmail!)),
    );
    this.ctx = {
      incomingEmailsByRowNumber: new Map(),
      existingEmails,
      existingTeamPartnerWishEmails,
    };
  }

  private addErr(result: SingleRowValidationResult, field: keyof ExcelImportRowData | null, message: string) {
    result.messages.push(err(field, message));
    result.status = worseStatus(result.status, 'ERROR');
  }

  private addWarn(result: SingleRowValidationResult, field: keyof ExcelImportRowData | null, message: string) {
    result.messages.push(warn(field, message));
    result.status = worseStatus(result.status, 'WARNING');
  }

  public validateImportRows(rows: ExcelImportRowData[]): ExcelImportRow[] {
    const validatedRows: ExcelImportRow[] = rows.map((data, index) => {
      const rowNumber = index + 1; // 1-based
      const validationResult = this.validateSingleRow(data, rowNumber);
      return {
        rowNumber,
        data,
        validationResult,
      };
    });

    this.validateTeamPartnerWishEmailsUnique(validatedRows);
    this.validateTeamPartnerWishEmailsFulfilled(validatedRows);

    return validatedRows;
  }

  private validateSingleRow(data: ExcelImportRowData, rowNumber: number): SingleRowValidationResult {
    const result: SingleRowValidationResult = {
      status: 'VALID',
      messages: [],
    };

    for (const { field, label } of MANDATORY_FIELDS) {
      if ((data[field] as string).trim() === '') {
        this.addErr(result, field, `Pflichtfeld fehlt: ${label}`);
      }
    }

    // --- Email format ---
    const emailNorm = getNormalizedEmail(data.email);
    if (emailNorm !== '' && !isValidEmail(emailNorm)) {
      this.addErr(result, 'email', 'Ungültige E-Mail-Adresse');
    }

    // --- Duplicate in file ---
    if (emailNorm !== '' && isValidEmail(emailNorm)) {
      const firstSeen = this.ctx.incomingEmailsByRowNumber.get(emailNorm);
      if (firstSeen === undefined) {
        this.ctx.incomingEmailsByRowNumber.set(emailNorm, rowNumber);
      } else if (firstSeen !== rowNumber) {
        this.addErr(result, 'email', `E-Mail doppelt in der Datei (zuerst in Zeile ${firstSeen})`);
      }
    }

    // --- Duplicate against existing participants ---
    if (emailNorm !== '' && this.ctx.existingEmails.has(emailNorm)) {
      this.addErr(result, 'email', 'E-Mail bereits registriert');
    }

    // --- Gender ---
    const genderRaw = data.gender.trim().toLowerCase();
    if (genderRaw !== '' && !VALID_GENDER_VALUES.has(genderRaw)) {
      this.addWarn(result, 'gender', 'Ungültiger Geschlechtswert (erwartet: m, w, divers)');
    }

    // --- numSeats ---
    const numSeatsRaw = data.numSeats.trim();
    if (numSeatsRaw !== '') {
      const parsed = parseInt(numSeatsRaw, 10);
      if (!Number.isFinite(parsed) || parsed < 0 || String(parsed) !== numSeatsRaw) {
        this.addWarn(result, 'numSeats', 'Ungültige Anzahl Sitzplätze (muss eine nicht-negative ganze Zahl sein)');
      }
    }

    // --- age ---
    const ageRaw = data.age.trim();
    if (ageRaw !== '') {
      const parsed = parseInt(ageRaw, 10);
      if (!Number.isFinite(parsed) || parsed <= 0 || String(parsed) !== ageRaw) {
        this.addWarn(result, 'age', 'Ungültiges Alter (muss eine positive ganze Zahl sein)');
      }
    }

    // --- Team partner wish: email ---
    const wishEmail = getNormalizedEmail(data.teamPartnerWishEmail);
    if (wishEmail !== '') {
      if (!isValidEmail(wishEmail)) {
        this.addErr(result, 'teamPartnerWishEmail', 'Ungültige Teamwunsch-E-Mail');
      } else if (wishEmail === emailNorm) {
        this.addErr(result, 'teamPartnerWishEmail', 'Teamwunsch-E-Mail darf nicht die eigene E-Mail sein');
      }
      // "partner not found" is checked in a second pass (all rows needed)
    }

    return result;
  }

  private validateTeamPartnerWishEmailsFulfilled(rows: ExcelImportRow[]) {
    for (const row of rows) {
      if (!hasValidTeamPartnerWishEmail(row.data)) {
        continue;
      }
      const teamPartnerWishEmail = getNormalizedEmail(row.data.teamPartnerWishEmail);
      if (this.ctx.existingEmails.has(teamPartnerWishEmail)) {
        continue;
      }
      if (this.ctx.incomingEmailsByRowNumber.has(teamPartnerWishEmail)) {
        continue;
      }
      row.validationResult.messages.push(info('teamPartnerWishEmail', 'Teamwunsch-E-Mail nicht gefunden'));
      row.validationResult.status = worseStatus(row.validationResult.status, 'INFO');
    }
  }

  private validateTeamPartnerWishEmailsUnique(rows: ExcelImportRow[]) {
    const teamPartnerWishEmailsInFileCount = new Map<string, number>();
    for (let i = 0; i < rows.length; i++) {
      if (!hasValidTeamPartnerWishEmail(rows[i].data)) {
        continue;
      }
      const teamPartnerWishEmail = getNormalizedEmail(rows[i].data.teamPartnerWishEmail);
      if (isValidEmail(teamPartnerWishEmail)) {
        if (!teamPartnerWishEmailsInFileCount.has(teamPartnerWishEmail)) {
          teamPartnerWishEmailsInFileCount.set(teamPartnerWishEmail, 1);
        } else {
          teamPartnerWishEmailsInFileCount.set(teamPartnerWishEmail, teamPartnerWishEmailsInFileCount.get(teamPartnerWishEmail)! + 1);
        }
      }
    }
    for (const row of rows) {
      if (!hasValidTeamPartnerWishEmail(row.data)) {
        continue;
      }
      const teamPartnerWishEmail = getNormalizedEmail(row.data.teamPartnerWishEmail);
      if (this.ctx.existingTeamPartnerWishEmails.has(teamPartnerWishEmail)) {
        this.addWarn(row.validationResult, 'teamPartnerWishEmail', 'Diese Teamwunsch-E-Mail wird bereits von einem bestehenden Teilnehmer als Wunsch angegeben');
        row.validationResult.status = worseStatus(row.validationResult.status, 'WARNING');
      }
      if (teamPartnerWishEmailsInFileCount.has(teamPartnerWishEmail) && teamPartnerWishEmailsInFileCount.get(teamPartnerWishEmail)! > 1) {
        this.addWarn(row.validationResult, 'teamPartnerWishEmail', 'Diese Teamwunsch-E-Mail kommt mehrfach in der Datei vor');
        row.validationResult.status = worseStatus(row.validationResult.status, 'WARNING');
      }
    }
  }
}
