import {add, format, getDate, getMonth, getYear} from "date-fns";

export function toLocalDateArr(date) {
  const year = getYear(date);
  const month = getMonth(date) + 1;
  const day = getDate(date);
  return [year, month, day];
}

export function plusDays(date, days) {
  return add(date, {
    days
  });
}

export function formatLocalDate(date, locale) {
  if (!date) {
    return undefined;
  }
  return format(date, 'dd.MM.yyyy');
}
