const { fetchGeocode, EXACTNESS_TYPE } = require('./geocoder');
const backend = require('./backend');

const findParticipant = async (adminId, participantId) => {
  return backend.findParticipantByAdminIdAndId(adminId, participantId);
};

async function performFetchGeocode(address) {

  let geocodes = await fetchGeocode(address);

  if (!geocodes || geocodes.length === 0) {
    return Promise.resolve(address);
  }

  geocodes = geocodes.filter((geocode) => { return geocode.exactness === EXACTNESS_TYPE.EXACT });

  if (geocodes.length <= 0 && address.zip && address.zip.length > 0) {
    const addressWithoutZip = {... address};
    addressWithoutZip.zip = "";
    geocodes = await fetchGeocode(addressWithoutZip);
    geocodes = geocodes.filter((geocode) => { return geocode.exactness === EXACTNESS_TYPE.EXACT });
  }

  if (geocodes.length <= 0) {
    return Promise.resolve(address);
  }

  const [first] = geocodes;
  return first;
}

const updateGeocodingInformation = async (adminId, participantId) => {
  const participant = await findParticipant(adminId, participantId);

  const result = await performFetchGeocode(participant);
  if (result.exactness === EXACTNESS_TYPE.EXACT) {
    return backend.updateParticipantGeocode(adminId, participantId, result.lat, result.lng, result.formattedAddress);
  } else {
    return result;
  }
};

const updateGeocodingInformationForAfterPartyLocation = async (adminId, runningDinner) => {
  if (!runningDinner.afterPartyLocation || !runningDinner.afterPartyLocation.zip) {
    return Promise.resolve(runningDinner);
  }

  const result = await performFetchGeocode(runningDinner.afterPartyLocation);
  if (result.exactness === EXACTNESS_TYPE.EXACT) {
    return backend.updateAfterPartyLocationGeocode(adminId, result.lat, result.lng, result.formattedAddress);
  } else {
    return result;
  }
}

module.exports = {
  updateGeocodingInformation,
  updateGeocodingInformationForAfterPartyLocation
};
