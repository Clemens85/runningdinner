const axios = require('axios');
const lodash = require('lodash');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const fetchGeocode = async ({street, streetNr, zip, cityName}) => {

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

  let types = googleResult.types || [];
  let locationType = lodash.get(googleResult, "geometry.location_type", "");
  let lat = lodash.get(googleResult, "geometry.location.lat", -1);
  let lng = lodash.get(googleResult, "geometry.location.lng", -1);

  let exact = locationType === 'ROOFTOP';
  exact = exact && types.includes("street_address");

  return {
    exact,
    lat,
    lng,
    formattedAddress: googleResult.formatted_address
  };
}

module.exports = {
  fetchGeocode
};
