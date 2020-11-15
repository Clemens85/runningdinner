import {CONSTANTS} from "../Constants";

export function getGenderTooltip(gender) {
  let result = 'Geschlecht nicht bekannt';
  if (gender === CONSTANTS.GENDER.MALE) {
    result = 'Männlich';
  } else if (gender === CONSTANTS.GENDER.FEMALE) {
    result = 'Weiblich';
  }
  return result;
}