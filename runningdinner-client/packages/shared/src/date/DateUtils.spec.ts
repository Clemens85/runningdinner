import {minusDays} from "./DateUtils"

it("minusDays subtracts days from Date", () => {

  const date = new Date(2021, 11, 10);
  expect(date.getDate()).toBe(10);

  const result = minusDays(date, 2);
  expect(result.getDate()).toBe(8); // 10 - 2 = 8

});
