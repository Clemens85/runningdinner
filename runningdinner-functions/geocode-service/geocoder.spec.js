const geocoder = require('./geocoder');

test('fetchGeocode is rejected for missing data', async () => {
  let participant = newParticipant();
  delete participant.street;
  await expect(geocoder.fetchGeocode(participant))
          .rejects.toThrow(Error);
});

test('fetchGeocode is works for complete data', async () => {
  let participant = newParticipant();
  const resultArr = await geocoder.fetchGeocode(participant);
  const [ result ] = resultArr;
  expect(result.lat).toBeGreaterThan(48);
  expect(result.lng).toBeGreaterThan(7.8);
  expect(result.exact).toBe(true);
});

function newParticipant() {
  return {
    street: 'Hauptstrasse',
    streetNr: '1',
    zip: '79100',
    cityName: 'Freiburg'
  }
}
