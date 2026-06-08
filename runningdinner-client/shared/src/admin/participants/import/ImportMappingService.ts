import { CONSTANTS } from '../../../Constants';
import { ParticipantFormModel } from '../../../types';
import { newEmptyParticipantInstance } from '../../../types';
import { ExcelImportRowData } from './types';

/** Values treated as boolean `true` when parsing flag columns (e.g. vegetarian, vegan, etc.) */
const TRUTHY_VALUES = new Set(['ja', 'yes', '1', 'true', 'x']);

function parseBoolColumn(raw: string): boolean {
  return TRUTHY_VALUES.has(raw.trim().toLowerCase());
}

function parseIntColumn(raw: string, fallback = -1): number {
  const trimmed = raw.trim();
  if (trimmed === '') return fallback;
  const parsed = parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Maps a raw `gender` string from the Excel sheet to a `CONSTANTS.GENDER` value.
 *
 * Accepted: 'm', 'männlich', 'male' → MALE
 *           'w', 'weiblich', 'female' → FEMALE
 *           unknown / empty → UNDEFINED
 */
export function mapGender(raw: string): string {
  switch (raw.trim().toLowerCase()) {
    case 'm':
    case 'männlich':
    case 'male':
      return CONSTANTS.GENDER.MALE;
    case 'w':
    case 'weiblich':
    case 'female':
      return CONSTANTS.GENDER.FEMALE;
    case '':
    default:
      return CONSTANTS.GENDER.UNDEFINED;
  }
}

/**
 * Maps a valid `ExcelImportRowData` to a `ParticipantFormModel` suitable for
 * `saveParticipantAsync`. Does NOT set `id` — leaving it unset (undefined) so
 * the backend treats it as a new participant.
 *
 * Note: teamPartnerWish fields are always applied here; the validation layer
 * determines whether they form a valid linked wish (email mode) or an unresolved
 * name-only wish (TeamPartnerWishRegistrationData mode).
 */
export function buildParticipantFromImportRow(row: ExcelImportRowData): ParticipantFormModel {
  const base = newEmptyParticipantInstance();

  const participant: ParticipantFormModel = {
    ...base,
    firstnamePart: row.firstnamePart.trim(),
    lastname: row.lastname.trim(),
    email: row.email.trim().toLowerCase(),
    gender: mapGender(row.gender),
    age: parseIntColumn(row.age),
    street: row.street.trim(),
    streetNr: row.streetNr.trim(),
    zip: row.zip.trim(),
    cityName: row.cityName.trim(),
    addressRemarks: row.addressRemarks.trim(),
    numSeats: parseIntColumn(row.numSeats),
    mobileNumber: row.mobileNumber.trim(),
    vegetarian: parseBoolColumn(row.vegetarian),
    vegan: parseBoolColumn(row.vegan),
    lactose: parseBoolColumn(row.lactose),
    gluten: parseBoolColumn(row.gluten),
    mealSpecificsNote: row.mealSpecificsNote.trim(),
    notes: row.notes.trim(),
    teamPartnerWishEmail: row.teamPartnerWishEmail.trim().toLowerCase(),
  };

  // If email wish not provided but name columns are filled → unresolved name wish
  const hasEmailWish = participant.teamPartnerWishEmail !== '';
  const hasNameWish = row.teamPartnerWishPartnerFirstname.trim() !== '' || row.teamPartnerWishPartnerLastname.trim() !== '';

  if (!hasEmailWish && hasNameWish) {
    participant.teamPartnerWishRegistrationData = {
      firstnamePart: row.teamPartnerWishPartnerFirstname.trim(),
      lastname: row.teamPartnerWishPartnerLastname.trim(),
    };
    // Ensure email wish is cleared
    participant.teamPartnerWishEmail = '';
  }

  return participant;
}
