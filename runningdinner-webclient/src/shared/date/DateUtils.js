import {format, parse} from 'date-fns';
import { getMonth, getDate, getYear, getHours, getMinutes, getSeconds, differenceInCalendarDays} from 'date-fns';

export function isAfterInDays(a, b) {
  const days = differenceInCalendarDays(a, b);
  return days > 0;
}

export function formatLocalDate(date, locale) {
  if (!date) {
    return date;
  }
  return format(date, 'dd.MM.yyyy');
}

export function formatLocalDateWithSeconds(date, locale) {
  if (!date) {
    return date;
  }
  return format(date, 'dd.MM.yyyy HH:mm:ss');
}

export function deserializeArrayToDate(incomingObj) {

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

export function serializeLocalDateToArray(incomingDate) {
  if (!incomingDate) {
    return null;
  }
  if (Array.isArray(incomingDate) && incomingDate.length === 3) {
    // Ensure that method can be called multiple times (even with already converted array object):
    return incomingDate;
  }
  return _serializeDateToArray(incomingDate, false);
}

export function serializeLocalDateTimeToArray(incomingDateTime) {
  if (!incomingDateTime) {
    return null;
  }
  if (Array.isArray(incomingDateTime) && incomingDateTime.length === 6) {
    // Ensure that method can be called multiple times (even with already converted array object):
    return incomingDateTime;
  }
  return _serializeDateToArray(incomingDateTime, true);
}

function _serializeDateToArray(incomingDate, includeTime) {
  var month = getMonth(incomingDate) + 1; //months from 1-12
  var day = getDate(incomingDate);
  var year = getYear(incomingDate);

  var result = [year, month, day];
  if (includeTime) {
    var hour = getHours(incomingDate);
    var minute = getMinutes(incomingDate);
    var second = getSeconds(incomingDate);
    result = result.concat([hour, minute, second]);
  }
  return result;
}
