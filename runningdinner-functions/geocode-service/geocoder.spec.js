const geocoder = require('./geocoder');

test('fetchGeocode is rejected for missing data', async () => {
  let participant = newParticipant();
  delete participant.street;
  await expect(geocoder.fetchGeocode(participant))
          .rejects.toThrow(Error);
});

test('fetchGeocode is works for complete data', async () => {
  jest.setTimeout(30000);
  let participant = newParticipant();
  let resultArr = await geocoder.fetchGeocode(participant);
  let [ result ] = resultArr;
  expect(result.lat).toBeGreaterThan(47);
  expect(result.lng).toBeGreaterThan(7.8);
  expect(result.exactness).toBe("APPROXIMATE");

  // Try without wrong zip which should yield in exact result:
  participant.zip = "";
  resultArr = await geocoder.fetchGeocode(participant);
  [ result ] = resultArr;
  expect(result.lat).toBeGreaterThan(47);
  expect(result.lng).toBeGreaterThan(7.8);
  expect(result.exactness).toBe("EXACT");
});

function newParticipant() {
  return {
    street: 'Hauptstrasse',
    streetNr: '1',
    zip: '79100',
    cityName: 'Freiburg'
  }
}
