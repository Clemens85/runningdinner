const axios = require('axios');
const lodash = require('lodash');
const {getSsmParameterCached} = require("./ssm");

const EXACTNESS_TYPE = {
  EXACT: "EXACT",
  UNKNOWN: "UNKNOWN",
  APPROXIMATE: "APPROXIMATE"
}

const getGoogleMapsApiKey = getSsmParameterCached({
  Name: "/runningdinner/googlemaps/apikey",
  WithDecryption: true,
}, 180 * 1000); // 3 Minutes

const fetchGeocode = async ({street, streetNr, zip, cityName}) => {

  const apiKeyParam = await getGoogleMapsApiKey();
  const API_KEY = apiKeyParam.Parameter.Value;

  if (!street || (!zip && !cityName)) {
    throw new Error("Missing street or zip/cityName");
  }

  let addressQuery = encodeURI(`${streetNr} ${street} ${zip} ${cityName}`);

  console.log(`Calling googlemaps API with ${addressQuery}`);
  let response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${addressQuery}&region=de&locale=de&sensor=false&key=${API_KEY}`);

  const status = lodash.get(response, "data.status");

  if (status === 'ZERO_RESULTS') {
    console.log(`Found no results for ${addressQuery}`);
    return [];
  } else if (status === 'OK') {
    return response.data.results
        .map(mapGoogleResult);
  }
  throw new Error(`Did not found any address for ${addressQuery}`);
};


function mapGoogleResult(googleResult) {
  if (!googleResult) {
    return {};
  }

  let locationType = lodash.get(googleResult, "geometry.location_type", "");
  let lat = lodash.get(googleResult, "geometry.location.lat", -1);
  let lng = lodash.get(googleResult, "geometry.location.lng", -1);

  let exactness = EXACTNESS_TYPE.UNKNOWN;
  if (locationType === 'ROOFTOP') {
    exactness = EXACTNESS_TYPE.EXACT;
  } else if (locationType === 'APPROXIMATE') {
    exactness = EXACTNESS_TYPE.APPROXIMATE;
  }

  return {
    exactness,
    lat,
    lng,
    formattedAddress: googleResult.formatted_address
  };
}

module.exports = {
  fetchGeocode,
  EXACTNESS_TYPE
};
