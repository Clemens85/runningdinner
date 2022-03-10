import {format, getDate, getMonth, getYear} from "date-fns";

export function toLocalDateArr(date) {
  const year = getYear(date);
  const month = getMonth(date) + 1;
  const day = getDate(date);
  return [year, month, day];
}

export function toMonthQueryString(date) {
  if (!date) {
    return '';
  }
  return format(date, 'yyyy-MM');
}

/**
 *
 * @param monthArr Should be a 2 or 3-dimensional array
 * @returns {Date}
 */
export function fromLocalDateArr(monthArr) {
  if (!monthArr || monthArr.length < 2) {
    return null;
  }
  return new Date(monthArr[0], monthArr[1] - 1, monthArr.length > 2 ? monthArr[2] : 1);
}