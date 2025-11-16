import { add, differenceInMinutes, format, isValid, parse, sub } from 'date-fns';
import { getMonth, getDate, getYear, getHours, getMinutes, getSeconds, differenceInCalendarDays } from 'date-fns';

export function isAfterInDays(a: Date, b: Date): boolean {
  const days = differenceInCalendarDays(a, b);
  return days > 0;
}

export function getDaysBetweenDates(a: Date, b: Date): number {
  const days = differenceInCalendarDays(a, b);
  return days;
}

export function getMinutesBetweenDates(a: Date, b: Date): number {
  return differenceInMinutes(a, b);
}

export function minusDays(date: Date, days: number): Date {
  return sub(date, {
    days,
  });
}

export function isSameDay(a: Date, b: Date) {
  return getDaysBetweenDates(a, b) === 0;
}

export function isValidDate(d: Date) {
  return isValid(d);
}

export function plusDays(date: Date, days: number): Date {
  return add(date, {
    days,
  });
}

export function plusHours(date: Date, hours: number): Date {
  return add(date, {
    hours,
  });
}

export function getHoursOfDate(date: Date) {
  return getHours(date);
}

export function getMinutesOfDate(date: Date) {
  return getMinutes(date);
}

export function withHourAndMinute(date: Date, hour: number, minute: number): Date {
  const result = new Date(date.getTime());
  result.setHours(hour, minute, 0, 0);
  return result;
}

export function setHoursAndMinutesFromSrcToDest(src: Date, dest: Date) {
  const hours = getHoursOfDate(src);
  const minutes = getMinutesOfDate(src);
  return withHourAndMinute(dest, hours, minutes);
}

export function formatLocalDate(date: Date | undefined): string | undefined {
  if (!date) {
    return undefined;
  }
  return format(date, 'dd.MM.yyyy');
}

export function parseLocalDateWithSeconds(dateStr: string | undefined): Date | undefined {
  if (!dateStr) {
    return undefined;
  }
  return parse(dateStr, 'dd.MM.yyyy HH:mm:ss', new Date());
}

export function formatLocalDateWithSeconds(date: Date | undefined): string | undefined {
  if (!date) {
    return undefined;
  }
  return format(date, 'dd.MM.yyyy HH:mm:ss');
}

export function getShortFormattedMonth(date: Date) {
  return format(date, 'MMM');
}
export function getDayOfMonthInNumbers(date: Date) {
  return format(date, 'dd');
}

export function toLocalDateQueryString(date: Date | undefined) {
  if (!date) {
    return '';
  }
  return format(date, 'yyyy-MM-dd');
}

export function deserializeArrayToDate(incomingObj: unknown): Date | unknown {
  if (!incomingObj || !Array.isArray(incomingObj) || incomingObj.length < 3 || incomingObj.length > 7) {
    return incomingObj;
  }

  const dateArray = incomingObj.slice(0, 6);
  const dateStr = dateArray.join(',');

  let result;
  if (dateArray.length === 3) {
    result = parse(dateStr, 'yyyy,MM,dd', new Date());
  } else if (dateArray.length === 5) {
    result = parse(dateStr, 'yyyy,MM,dd,HH,m', new Date());
  } else {
    result = parse(dateStr, 'yyyy,MM,dd,HH,m,s', new Date());
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

export function serializeLocalDateTimeToArray(incomingDateTime: Date | Array<number> | undefined): Array<number> | null {
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

  let result = [year, month, day];
  if (includeTime) {
    const hour = getHours(incomingDate);
    const minute = getMinutes(incomingDate);
    const second = getSeconds(incomingDate);
    result = result.concat([hour, minute, second]);
  }
  return result;
}
