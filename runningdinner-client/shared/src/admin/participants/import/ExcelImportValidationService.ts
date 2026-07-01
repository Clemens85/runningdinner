import { Participant } from '../../../types';
import { isStringNotEmpty } from '../../../Utils';
import { ExcelImportRow, ExcelImportRowData, ExcelImportRowStatus, ExcelImportValidationMessage, SingleRowValidationResult } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_GENDER_VALUES = new Set(['m', 'w', '', 'männlich', 'weiblich', 'male', 'female']);

/** Minimal translate function type — keeps this service decoupled from react-i18next */
type TFunc = (key: string, options?: Record<string, unknown>) => string;

/** Maps ExcelImportRowData mandatory fields to their admin-namespace i18n label keys */
const FIELD_LABEL_KEY: Partial<Record<keyof ExcelImportRowData, string>> = {
  firstnamePart: 'import_field_firstname',
  lastname: 'import_field_lastname',
  email: 'import_field_email',
  street: 'import_field_street',
  streetNr: 'import_field_streetNr',
  zip: 'import_field_zip',
  cityName: 'import_field_cityName',
};

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
  if (isStringNotEmpty(email)) {
    return email.trim().toLowerCase();
  }
  return email;
}

function isSameEmail(a: string, b: string) {
  return isStringNotEmpty(a) && isStringNotEmpty(b) && getNormalizedEmail(a) === getNormalizedEmail(b);
}

function hasValidTeamPartnerWishEmail(row: ExcelImportRowData) {
  return isStringNotEmpty(row.teamPartnerWishEmail) && !isSameEmail(row.teamPartnerWishEmail, row.email);
}

interface ValidationContext {
  incomingEmailsByRowNumber: Map<string, number>; // email → first row number that has it
  /** email → participant id; only non-child participants (child = teamPartnerWishOriginatorId set to someone else's id) */
  existingParticipantIdsByEmail: Map<string, string>;
  /** all existing participant emails — used to resolve team-partner-wish email references */
  allExistingEmails: Set<string>;
  existingTeamPartnerWishEmails: Set<string>;
}

// --- Mandatory string fields ---
const MANDATORY_FIELDS: Array<keyof ExcelImportRowData> = ['firstnamePart', 'lastname', 'email', 'street', 'streetNr', 'zip', 'cityName'];

export class ExcelImportValidationService {
  private ctx: ValidationContext;
  private t: TFunc;

  constructor(existingParticipants: Participant[], t: TFunc) {
    this.t = t;
    // Child participants (fixed partner auto-created records) are intentionally excluded from update candidates
    const nonChildParticipants = existingParticipants.filter((p) => !p.teamPartnerWishOriginatorId || p.teamPartnerWishOriginatorId === p.id);
    const existingParticipantIdsByEmail = new Map(nonChildParticipants.map((p) => [getNormalizedEmail(p.email), p.id!] as [string, string]));
    const existingTeamPartnerWishEmails = new Set(
      existingParticipants.filter((p) => isStringNotEmpty(p.teamPartnerWishEmail)).map((p) => getNormalizedEmail(p.teamPartnerWishEmail!)),
    );
    this.ctx = {
      incomingEmailsByRowNumber: new Map(),
      existingParticipantIdsByEmail,
      allExistingEmails: new Set(existingParticipants.map((p) => getNormalizedEmail(p.email))),
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

  private addInfo(result: SingleRowValidationResult, field: keyof ExcelImportRowData | null, message: string) {
    result.messages.push(info(field, message));
    result.status = worseStatus(result.status, 'INFO');
  }

  public validateImportRows(rows: ExcelImportRowData[]): ExcelImportRow[] {
    const validatedRows: ExcelImportRow[] = rows.map((data, index) => {
      const rowNumber = index + 1; // 1-based
      const { result: validationResult, existingParticipantId } = this.validateSingleRow(data, rowNumber);
      return {
        rowNumber,
        data,
        validationResult,
        ...(existingParticipantId !== undefined && { existingParticipantId }),
      };
    });

    this.validateTeamPartnerWishEmailsUnique(validatedRows);
    this.validateTeamPartnerWishEmailsFulfilled(validatedRows);

    return validatedRows;
  }

  private validateSingleRow(data: ExcelImportRowData, rowNumber: number): { result: SingleRowValidationResult; existingParticipantId?: string } {
    const result: SingleRowValidationResult = {
      status: 'VALID',
      messages: [],
    };
    let existingParticipantId: string | undefined;

    for (const field of MANDATORY_FIELDS) {
      if ((data[field] as string).trim() === '') {
        const labelKey = FIELD_LABEL_KEY[field];
        const fieldLabel = labelKey ? this.t(`admin:${labelKey}`) : String(field);
        this.addErr(result, field, this.t('admin:import_error_missing_field', { field: fieldLabel }));
      }
    }

    // --- Email format ---
    const emailNorm = getNormalizedEmail(data.email);
    if (emailNorm !== '' && !isValidEmail(emailNorm)) {
      this.addErr(result, 'email', this.t('admin:import_error_invalid_email'));
    }

    // --- Duplicate in file ---
    if (emailNorm !== '' && isValidEmail(emailNorm)) {
      const firstSeen = this.ctx.incomingEmailsByRowNumber.get(emailNorm);
      if (firstSeen === undefined) {
        this.ctx.incomingEmailsByRowNumber.set(emailNorm, rowNumber);
      } else if (firstSeen !== rowNumber) {
        this.addErr(result, 'email', this.t('admin:import_error_duplicate_infile', { row: firstSeen }));
      }
    }

    // --- Duplicate against existing participants ---
    if (emailNorm !== '' && this.ctx.existingParticipantIdsByEmail.has(emailNorm)) {
      existingParticipantId = this.ctx.existingParticipantIdsByEmail.get(emailNorm);
      this.addErr(result, 'email', this.t('admin:import_error_duplicate_existing'));
    }

    // --- Gender ---
    const genderRaw = data.gender.trim().toLowerCase();
    if (genderRaw !== '' && !VALID_GENDER_VALUES.has(genderRaw)) {
      this.addWarn(result, 'gender', this.t('admin:import_warning_invalid_gender'));
    }

    // --- numSeats ---
    const numSeatsRaw = data.numSeats.trim();
    const numSeatsNum = Number(numSeatsRaw);
    if (numSeatsRaw === '' || !Number.isInteger(numSeatsNum) || numSeatsNum < 0) {
      this.addErr(result, 'numSeats', this.t('admin:import_error_invalid_numseats'));
    }

    // --- age ---
    const ageRaw = data.age.trim();
    if (ageRaw !== '') {
      const parsed = parseInt(ageRaw, 10);
      if (!Number.isFinite(parsed) || parsed <= 0 || String(parsed) !== ageRaw) {
        this.addWarn(result, 'age', this.t('admin:import_warning_invalid_age'));
      }
    }

    // --- Team partner wish: Option 1 (invitation by email) ---
    const wishEmail = getNormalizedEmail(data.teamPartnerWishEmail);
    const hasPartnerName = data.teamPartnerWishPartnerFirstname.trim() !== '' || data.teamPartnerWishPartnerLastname.trim() !== '';

    if (wishEmail !== '') {
      if (!isValidEmail(wishEmail)) {
        this.addErr(result, 'teamPartnerWishEmail', this.t('admin:import_error_invalid_email'));
      } else if (wishEmail === emailNorm) {
        this.addErr(result, 'teamPartnerWishEmail', this.t('admin:import_error_self_reference'));
      }
      if (hasPartnerName) {
        this.addErr(result, null, this.t('admin:import_error_option1_option2_conflict'));
      }
      // "partner not found" is checked in a second pass (all rows needed)
    }

    // --- Team partner wish: Option 2 (fixed partner co-registration) ---
    if (!wishEmail && hasPartnerName) {
      if (data.teamPartnerWishPartnerLastname.trim() === '') {
        this.addErr(result, 'teamPartnerWishPartnerLastname', this.t('admin:import_error_partner_lastname_missing'));
      }
      if (data.teamPartnerWishPartnerFirstname.trim() === '') {
        this.addErr(result, 'teamPartnerWishPartnerFirstname', this.t('admin:import_error_partner_firstname_missing'));
      }
      const partnerEmail = getNormalizedEmail(data.teamPartnerWishPartnerEmail);
      if (partnerEmail !== '' && !isValidEmail(partnerEmail)) {
        this.addErr(result, 'teamPartnerWishPartnerEmail', this.t('admin:import_error_partner_invalid_email'));
      }
      if (partnerEmail !== '' && partnerEmail === emailNorm) {
        this.addErr(result, 'teamPartnerWishPartnerEmail', this.t('admin:import_error_partner_self_reference'));
      }
      // The registrant must be able to host for both → numSeats must be a positive integer
      const numSeatsForPartner = parseInt(data.numSeats.trim(), 10);
      if (!Number.isFinite(numSeatsForPartner) || numSeatsForPartner <= 0) {
        this.addErr(result, 'numSeats', this.t('admin:import_error_partner_numseats_required'));
      }
    }

    return { result, existingParticipantId };
  }

  private validateTeamPartnerWishEmailsFulfilled(rows: ExcelImportRow[]) {
    for (const row of rows) {
      if (!hasValidTeamPartnerWishEmail(row.data)) {
        continue;
      }
      const teamPartnerWishEmail = getNormalizedEmail(row.data.teamPartnerWishEmail);
      if (this.ctx.allExistingEmails.has(teamPartnerWishEmail)) {
        continue;
      }
      if (this.ctx.incomingEmailsByRowNumber.has(teamPartnerWishEmail)) {
        continue;
      }
      this.addInfo(row.validationResult, 'teamPartnerWishEmail', this.t('admin:import_warning_partner_not_found'));
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
        this.addWarn(row.validationResult, 'teamPartnerWishEmail', this.t('admin:import_warning_partner_wish_already_used'));
      }
      if (teamPartnerWishEmailsInFileCount.has(teamPartnerWishEmail) && teamPartnerWishEmailsInFileCount.get(teamPartnerWishEmail)! > 1) {
        this.addWarn(row.validationResult, 'teamPartnerWishEmail', this.t('admin:import_warning_partner_wish_duplicate_infile'));
      }
    }
  }
}
