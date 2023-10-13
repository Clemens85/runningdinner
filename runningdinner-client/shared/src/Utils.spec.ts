import {
  trimStringsInObject
} from "./Utils"

it("trimStringsInObject should trim strings in object and don't modify non-string objects and/or other datatypes", () => {

  const now = new Date();
  const myObj = {
    email: "foo@bar.de",
    email2: "foo@bar.de  ",
    nr: 1,
    dateType: now,
    myArr: ['a', 'b'],
    subObj: {
      otherNr: 1,
      otherStr: " foo "
    }
  };

  const result = trimStringsInObject(myObj);
  expect(result.email).toBe("foo@bar.de");
  expect(result.email2).toBe("foo@bar.de");
  expect(result.nr).toBe(1);
  expect(result.dateType).toEqual(now);
  expect(result.myArr).toEqual(['a', 'b']);
  expect(result.subObj.otherNr).toBe(1);
  expect(result.subObj.otherStr).toBe("foo");

  // Original obj should not be touched
  expect(myObj.email2).toBe("foo@bar.de  ")
});
