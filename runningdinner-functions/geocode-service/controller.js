// const db = require('../database/db');
const geocoder = require('./geocoder');
const backend = require('./backend');

const findParticipant = async (adminId, participantId) => {
  return backend.findParticipantByAdminIdAndId(adminId, participantId);
};

const updateGeocodingInformation = async (adminId, participantId) => {
  const participant = await findParticipant(adminId, participantId);

  let geocodes = await geocoder.fetchGeocode(participant);
  geocodes = geocodes.filter((geocode) => { return geocode.exact; });

  if (geocodes.length <= 0) {
    return Promise.resolve(participant);
  }
  const [first] = geocodes;

  return backend.updateParticipantGeocode(adminId, participantId, first.lat, first.lng, first.formattedAddress);
};

const updateGeocodingInformationForAfterPartyLocation = async (adminId, runningDinner) => {
  if (!runningDinner.afterPartyLocation || !runningDinner.afterPartyLocation.zip) {
    return Promise.resolve(runningDinner);
  }

  let geocodes = await geocoder.fetchGeocode(runningDinner.afterPartyLocation);
  geocodes = geocodes.filter((geocode) => { return geocode.exact; });

  if (geocodes.length <= 0) {
    return Promise.resolve(runningDinner);
  }
  const [first] = geocodes;

  return backend.updateAfterPartyLocationGeocode(adminId, first.lat, first.lng, first.formattedAddress);
}

module.exports = {
  updateGeocodingInformation,
  updateGeocodingInformationForAfterPartyLocation
};
