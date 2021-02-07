import {format, parse} from 'date-fns';
import { getMonth, getDate, getYear, getHours, getMinutes, getSeconds, differenceInCalendarDays} from 'date-fns';

export function isAfterInDays(a: Date, b: Date): boolean {
  const days = differenceInCalendarDays(a, b);
  return days > 0;
}

export function formatLocalDate(date: Date | undefined, locale?: string): (string | undefined) {
  if (!date) {
    return undefined;
  }
  return format(date, 'dd.MM.yyyy');
}

export function formatLocalDateWithSeconds(date: Date | undefined, locale?: string) : (string | undefined) {
  if (!date) {
    return undefined;
  }
  return format(date, 'dd.MM.yyyy HH:mm:ss');
}

export function deserializeArrayToDate(incomingObj: unknown): Date | unknown {

  if (!incomingObj || !Array.isArray(incomingObj) || incomingObj.length < 3 || incomingObj.length > 7) {
    return incomingObj;
  }

  const dateArray = incomingObj.slice(0, 6);
  const dateStr = dateArray.join(',');

  let result;
  if (dateArray.length === 3) {
    result = parse(dateStr, "yyyy,MM,dd", new Date());
  } else if (dateArray.length === 5) {
    result = parse(dateStr, "yyyy,MM,dd,HH,m", new Date());
  } else {
    result = parse(dateStr, "yyyy,MM,dd,HH,m,s", new Date());
  }
  return result;
}

export function serializeLocalDateToArray(incomingDate: Date | Array<number> | undefined): Array<number> | undefined {
  if (!incomingDate) {
    return undefined;
  }
  if (Array.isArray(incomingDate) && incomingDate.length === 3) {
    // Ensure that method can be called multiple times (even with already converted array object):
    return incomingDate;
  }
  if (Array.isArray(incomingDate)) {
    throw new Error(`IncomingDate is an array, but cannot be handled due to length !== 3: ${incomingDate}`);
  }
  return _serializeDateToArray(incomingDate, false);
}

export function serializeLocalDateTimeToArray(incomingDateTime: Date | Array<number> | undefined):  Array<number> | null {
  if (!incomingDateTime) {
    return null;
  }
  if (Array.isArray(incomingDateTime) && incomingDateTime.length === 6) {
    // Ensure that method can be called multiple times (even with already converted array object):
    return incomingDateTime;
  }
  if (Array.isArray(incomingDateTime)) {
    throw new Error(`IncomingDate is an array, but cannot be handled due to length !== 6: ${incomingDateTime}`);
  }
  return _serializeDateToArray(incomingDateTime, true);
}

function _serializeDateToArray(incomingDate: Date, includeTime: boolean): Array<number> {
  const month = getMonth(incomingDate) + 1; //months from 1-12
  const day = getDate(incomingDate);
  const year = getYear(incomingDate);

  var result = [year, month, day];
  if (includeTime) {
    const hour = getHours(incomingDate);
    const minute = getMinutes(incomingDate);
    const second = getSeconds(incomingDate);
    result = result.concat([hour, minute, second]);
  }
  return result;
}
