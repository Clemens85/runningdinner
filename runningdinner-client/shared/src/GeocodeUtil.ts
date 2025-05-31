import { GeocodingResult } from './types';

export const AFTER_PARTY_LOCATION_MARKER_NUMBER = 'A';

export function isGeocodingResultValid(geocodingResult?: GeocodingResult): geocodingResult is GeocodingResult {
  if (!geocodingResult || typeof geocodingResult === 'undefined') {
    return false;
  }
  if (geocodingResult.lat === null || geocodingResult.lat === undefined || geocodingResult.lng === null || geocodingResult.lng === undefined) {
    return false;
  }
  if (typeof geocodingResult.lat !== 'number' || typeof geocodingResult.lng !== 'number') {
    return false;
  }
  /**
   * -1 is actually valid for both lat and lng.
   * It is however extremely unrealistic that a person really has a geocoded address of (-1,-1), so we stick to this combination as being a not properly geocoded address.
   * A better solution would be to use the Double as datatype which can be null for a not geocoded address, but this yields into some migration effort
   */
  return geocodingResult.lat !== -1 && geocodingResult.lng !== -1;
}
