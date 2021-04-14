import React from "react";
import Geocode from "react-geocode";
import {DinnerRouteTeam, GeocodingResult, isSameDinnerRouteTeam, Participant, TeamStatus} from "./types";

export function isGeocodingResultValid(geocodingResult?: GeocodingResult): geocodingResult is GeocodingResult {
  if (!geocodingResult || typeof geocodingResult === 'undefined') {
    return false;
  }
  // @ts-ignore
  return geocodingResult?.lat >= 0 && geocodingResult?.lng >= 0;
}

export function createMarkerIconUrl(markerNumber: number, isCurrent: boolean): string {
  const textColor = '000000';
  let bgColor = '6db33f';
  if (isCurrent) {
    bgColor = '999999';
  }
  return `https://chart.googleapis.com/chart?chst=d_map_pin_letter_withshadow&chld=${markerNumber}|${bgColor}|${textColor}`;
}

export function filterDinnerRouteTeamsForValidGeocdingResults(dinnerRouteTeams: DinnerRouteTeam[]) {
  return dinnerRouteTeams
            .filter(dinnerRouteTeam => isGeocodingResultValid(dinnerRouteTeam.geocodingResult));
}

export function getCenterPosition(dinnerRouteTeams: DinnerRouteTeam[], currentTeam: DinnerRouteTeam): GeocodingResult | undefined {
  const centerPositionCandidates = filterDinnerRouteTeamsForValidGeocdingResults(dinnerRouteTeams);
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

  async function getGeocodePosition(participant: Participant): Promise<GeocodingResult> {
    if (isGeocodingResultValid(participant.geocodingResult)) {
      return participant.geocodingResult;
    }
    const address = getAddress(participant);
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
        result.push(teams[i]); // Cancelled team can not be geocded
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

  function getAddress(participant: Participant) {
    return `${participant.streetNr} ${participant.street}, ${participant.zip} ${participant.cityName || ''}`;
  }

  return {
    getGeocodePosition,
    getGeocodePositionsOfTeamHosts
  };
}
