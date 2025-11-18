import { formatLocalDate, getHoursOfDate, getMinutesOfDate, minusDays, setHoursAndMinutesFromSrcToDest } from './DateUtils';

it('minusDays subtracts days from Date', () => {
  const date = new Date(2021, 11, 10);
  expect(date.getDate()).toBe(10);

  const result = minusDays(date, 2);
  expect(result.getDate()).toBe(8); // 10 - 2 = 8
});

it('setHoursAndMinutesFromSrcToDest sets hours and minutes from source date to dest date', () => {
  const srcDate = new Date(2021, 11, 10, 14, 30, 0);
  const result = setHoursAndMinutesFromSrcToDest(srcDate, new Date(2022, 3, 30));

  expect(getHoursOfDate(result)).toBe(14);
  expect(getMinutesOfDate(result)).toBe(30);
  expect(formatLocalDate(result)).toBe('30.04.2022');
});
