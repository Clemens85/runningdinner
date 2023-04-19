import React from "react";
import Geocode from "react-geocode";
import {
  DinnerRouteTeam,
  GeocodingResult,
  isSameDinnerRouteTeam,
  TeamStatus,
  Team,
  AfterPartyLocation, BaseAddress, HasGeocoding
} from "./types";
import {isAfterPartyLocationDefined} from "./admin";
import cloneDeep from "lodash/cloneDeep";

export const AFTER_PARTY_LOCATION_MARKER_NUMBER = "A";

export function isGeocodingResultValid(geocodingResult?: GeocodingResult): geocodingResult is GeocodingResult {
  if (!geocodingResult || typeof geocodingResult === 'undefined') {
    return false;
  }
  // @ts-ignore
  return geocodingResult?.lat >= 0 && geocodingResult?.lng >= 0;
}

export function createMarkerIconUrl(markerNumber: string, isCurrent: boolean): string {
  const textColor = '000000';
  let bgColor = '999999';
  if (isCurrent) {
    bgColor = '6db33f';
  }
  if (markerNumber === AFTER_PARTY_LOCATION_MARKER_NUMBER) {
    bgColor = "f50057";
  }
  return `https://chart.googleapis.com/chart?chst=d_map_pin_letter_withshadow&chld=${markerNumber}|${bgColor}|${textColor}`;
}

export function filterForValidGeocdingResults<T extends HasGeocoding>(geocodedObjects: T[]): T[] {
  return geocodedObjects
            .filter(geocodedObject => isGeocodingResultValid(geocodedObject.geocodingResult));
}

export function isGeocdingResultValidForAllTeams(dinnerRouteTeams: DinnerRouteTeam[]): boolean {
  const dinnerRouteTeamsNotCancelled = dinnerRouteTeams.filter(drt => drt.status !== TeamStatus.CANCELLED);
  return dinnerRouteTeamsNotCancelled.length === filterForValidGeocdingResults(dinnerRouteTeamsNotCancelled).length;
}

export function getCenterPosition(dinnerRouteTeams: DinnerRouteTeam[], currentTeam: DinnerRouteTeam | Team): GeocodingResult | undefined {
  const centerPositionCandidates = filterForValidGeocdingResults(dinnerRouteTeams);
  if (centerPositionCandidates.length === 0) {
    return undefined;
  }
  for (let i = 0; i < centerPositionCandidates.length; i++) {
    if (isSameDinnerRouteTeam(centerPositionCandidates[i], currentTeam)) {
      return centerPositionCandidates[i].geocodingResult;
    }
  }
  return centerPositionCandidates[0].geocodingResult; // Fallback
}

export function useGeocoder(googleMapsApiKey: string, language = 'de') {

  React.useEffect(() => {
    // set Google Maps Geocoding API for purposes of quota management. Its optional but recommended.
    Geocode.setApiKey(googleMapsApiKey);
    // set response language. Defaults to english.
    Geocode.setLanguage(language);
  }, [googleMapsApiKey, language]);


  async function getGeocodePosition<T extends BaseAddress & HasGeocoding>(addressObject: T): Promise<GeocodingResult> {
    if (isGeocodingResultValid(addressObject.geocodingResult)) {
      return addressObject.geocodingResult;
    }
    const address = getAddress(addressObject);
    const response = await Geocode.fromAddress(address);
    return response.results[0].geometry.location;
  }

  async function getGeocodePositionsOfTeamHosts(teams: DinnerRouteTeam[]): Promise<DinnerRouteTeam[]> {
    const asyncResults = [];
    for (let i = 0; i < teams.length; i++) {
      if (teams[i].status === TeamStatus.CANCELLED) {
        asyncResults.push(undefined);
      } else {
        asyncResults.push(getGeocodePosition(teams[i].hostTeamMember));
      }
    }

    const result = [];
    for (let i = 0; i < asyncResults.length; i++) {
      if (typeof asyncResults[i] === "undefined") {
        result.push(teams[i]); // Cancelled team can not be geocoded
        continue;
      }
      try {
        const geocodingResult = await asyncResults[i];
        result.push({
          ...teams[i],
          geocodingResult
        })
      } catch (e) {
        // @ts-ignore
        console.log(`Failed to fetch geocoding for team ${teams[i].teamNumber} with address ${getAddress(teams[i].hostTeamMember)}: ${JSON.stringify(e)}`);
        result.push(teams[i]);
      }
    }

    return result;
  }

  async function getGeocodePositionOfAfterPartyLocation(afterPartyLocation?: AfterPartyLocation): Promise<AfterPartyLocation | undefined> {
    if (!afterPartyLocation || !isAfterPartyLocationDefined(afterPartyLocation)) {
      return undefined;
    }

    const result = cloneDeep(afterPartyLocation);
    try {
      const geocodingResult = await getGeocodePosition(afterPartyLocation);
      result.geocodingResult = geocodingResult;
    } catch (e) {
      // @ts-ignore
      console.log(`Failed to fetch geocoding for afterPartyLocation with address ${getAddress(afterPartyLocation)}: ${JSON.stringify(e)}`);
    }
    return result;
  }

  function getAddress(participant: BaseAddress) {
    return `${participant.streetNr} ${participant.street}, ${participant.zip} ${participant.cityName || ''}`;
  }

  return {
    getGeocodePosition,
    getGeocodePositionsOfTeamHosts,
    getGeocodePositionOfAfterPartyLocation
  };
}
