const axios = require('axios');

let backendBaseUrl = process.env.BACKEND_BASE_URL;

const findParticipantByAdminIdAndId = async (adminId, participantId) => {
  console.log(`Calling runyourdinner backend with ${adminId} and ${participantId}`);
  let response = await axios.get(`${backendBaseUrl}/participantservice/v1/runningdinner/${adminId}/participants/${participantId}`);
  return response.data;
};

const updateParticipantGeocode = async (adminId, participantId, lat, lng, formattedAddress) => {

  let url = `${backendBaseUrl}/participantservice/v1/runningdinner/${adminId}/participants/${participantId}/geocode`;
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
  updateParticipantGeocode
};
