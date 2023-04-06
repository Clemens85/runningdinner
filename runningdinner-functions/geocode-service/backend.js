const axios = require('axios');

const backendBaseUrl = process.env.BACKEND_BASE_URL;

const findParticipantByAdminIdAndId = async (adminId, participantId) => {
  console.log(`Retrieving participant with ${adminId} and ${participantId}`);
  let response = await axios.get(`${backendBaseUrl}/participantservice/v1/runningdinner/${adminId}/participants/${participantId}`);
  return response.data;
};

const updateParticipantGeocode = async (adminId, participantId, lat, lng, formattedAddress) => {

  let url = `${backendBaseUrl}/participantservice/v1/runningdinner/${adminId}/participants/${participantId}/geocode`;
  console.info(`Calling backend with ${url}`);
  let response = await axios({
    url: url,
    method: 'put',
    data: {
      lat,
      lng,
      formattedAddress,
      resultType: 'EXACT'
    }
  });
  return response.data;
};

const updateAfterPartyLocationGeocode = async (adminId, lat, lng, formattedAddress) => {

  let url = `${backendBaseUrl}/runningdinnerservice/v1/runningdinner/${adminId}/afterpartylocation/geocode`;
  console.info(`Calling backend with ${url}`);
  let response = await axios({
    url: url,
    method: 'put',
    data: {
      lat,
      lng,
      formattedAddress,
      resultType: 'EXACT'
    }
  });
  return response.data;
};


module.exports = {
  findParticipantByAdminIdAndId,
  updateParticipantGeocode,
  updateAfterPartyLocationGeocode
};
