import { BaseRunningDinnerProps, DinnerRouteTeam, Fullname, TeamNr, Time,  getFullname,  isQuerySucceeded, isStringNotEmpty, useGeocoder } from "@runningdinner/shared";
import { useRef, useState } from "react";
import { useDynamicFullscreenHeight } from "../../common/hooks/DynamicFullscreenHeightHook";
import { APIProvider, AdvancedMarker, InfoWindow, Map, Pin, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { FetchProgressBar } from "../../common/FetchProgressBar";
import { useTranslation } from "react-i18next";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Box, styled } from "@mui/system";
import { SmallTitle, Span, Subtitle } from "../../common/theme/typography/Tags";
import { Polyline } from "../../common/maps";
import { DinnerRouteMapData, DinnerRouteTeamMapEntry, TeamConnectionPath, calculateDinnerRouteMapData, distinctDinnerRouteTeams, useFindAllDinnerRoutes } from "./HostLocationsService";
import { Alert, AlertTitle } from "@mui/material";
import { cloneDeep } from "lodash-es";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY_JS || "";

export function HostLocationsPage({runningDinner}: BaseRunningDinnerProps) {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY}>
      <HostLocationsMapsPage runningDinner={runningDinner} />
    </APIProvider>
  )
}

function HostLocationsMapsPage({runningDinner}: BaseRunningDinnerProps) {
  
  const { i18n } = useTranslation();
  const {getGeocodePositionsOfTeamHosts} = useGeocoder(GOOGLE_MAPS_KEY, i18n.language);

  const {adminId} = runningDinner;

  const dinnerRoutesQueryResult = useFindAllDinnerRoutes(adminId);
  const allDinnerRoutes = dinnerRoutesQueryResult.data?.dinnerRoutes || [];
  let allDinnerRouteTeams = allDinnerRoutes.flatMap(dinnerRoute => dinnerRoute.teams);
  allDinnerRouteTeams = distinctDinnerRouteTeams(allDinnerRouteTeams);

  const geocodePositionsQueryResult = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => getGeocodePositionsOfTeamHosts(allDinnerRouteTeams),
    queryKey: ['getGeocodePositionsOfTeamHosts', allDinnerRouteTeams],
    enabled: allDinnerRouteTeams.length > 0,
  });

  if (!isQuerySucceeded(geocodePositionsQueryResult)) {
    return <FetchProgressBar {...dinnerRoutesQueryResult} />;
  }

  const dinnerRouteMapData = calculateDinnerRouteMapData(allDinnerRoutes, geocodePositionsQueryResult.data);

  if (dinnerRouteMapData.dinnerRouteMapEntries.length === 0) {
    return <WarningAlert />;
  }

  return (
    <HostLocationsView {...dinnerRouteMapData} />
  )
}

function HostLocationsView({showWarnings, dinnerRouteMapEntries, centerPosition}: DinnerRouteMapData) {

  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400);

  const [teamHostMarkersActive, setTeamHostMarkersActive] = useState<Record<number, DinnerRouteTeamMapEntry>>({});
  
  const allTeamConnectionPaths = dinnerRouteMapEntries.flatMap(team => team.teamConnectionPaths);

  const handleTeamHostMarkerOpen = (dinnerRouteTeam: DinnerRouteTeamMapEntry, open: boolean) => {
    setTeamHostMarkersActive(prevState => {
      const result = cloneDeep(prevState);
      if (open) {
        result[dinnerRouteTeam.teamNumber] = dinnerRouteTeam;
      } else {
        delete result[dinnerRouteTeam.teamNumber];
      }
      return result;
    });
  };

  const calculatePaths = () => {

    const colorsToShow = new Array<string>();
    Object.keys(teamHostMarkersActive).forEach((teamNumber) => {
      const activeDinnerRouteTeamMapEntry = teamHostMarkersActive[parseInt(teamNumber)];
      if (activeDinnerRouteTeamMapEntry) {
        colorsToShow.push(activeDinnerRouteTeamMapEntry.color);
      }
    });

    const result: Record<string, TeamConnectionPath[]> = {};
    for (let i = 0; i < allTeamConnectionPaths.length; i++) {
      const color = allTeamConnectionPaths[i].color;

      if (colorsToShow.length > 0 && !colorsToShow.includes(color)) {
        continue;
      }

      if (!result[color]) {
        result[color] = [];
      }
      result[color].push(allTeamConnectionPaths[i]);
    }
    return result;
  }


  const pathsByTeam = calculatePaths();

  return (
    <div ref={mapContainerRef}>
      <Map defaultCenter={{ lat: centerPosition.lat!, lng: centerPosition.lng! }}
            defaultZoom={11} 
            style={{ height: `${mapHeight}px`}}
            mapId="5062543108f93729">
            
        { Object.keys(pathsByTeam).map(color => 
            <Polyline 
              key={color} 
              strokeWeight={6}
              geodesic={true}
              icons={[ { icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW }, offset: '100%' } ]}
              strokeOpacity={0.75} 
              path={pathsByTeam[color].map(path => ({lat: path.path.lat!, lng: path.path.lng!}))}
              strokeColor={color}/>
          )
        }

        { dinnerRouteMapEntries
            .map(team => <TeamHostMarker key={team.teamNumber} 
                                         handleOpen={(open) => handleTeamHostMarkerOpen(team, open)}
                                         isOpen={teamHostMarkersActive[team.teamNumber] !== undefined}
                                         team={team} />) 
        }
    
      </Map>
      { showWarnings && <WarningAlert /> }
    </div>
  )
}

type TeamHostMarkerProps = {
  handleOpen: (open: boolean) => void;
  team: DinnerRouteTeamMapEntry;
  isOpen: boolean;
}

function TeamHostMarker({team, handleOpen, isOpen}: TeamHostMarkerProps) {
  
  // const [infowindowOpen, setInfowindowOpen] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker 
        ref={markerRef}
        title={`Team ${team.teamNumber} - ${team.meal.label} (${getFullname(team.hostTeamMember)})`}
        onClick={() => handleOpen(!isOpen)}
        position={{ lat: team.position.lat!, lng: team.position.lng! }}> 
        <Pin 
          scale={1.5}
          background={team.color}
          borderColor={'#000'}>
            <center>{team.meal.label.substring(0, 4)}</center> <center>#{team.teamNumber}</center>
          </Pin>
      </AdvancedMarker>
      {isOpen && (
        <InfoWindow
          anchor={marker}
          maxWidth={300}
          onCloseClick={() => handleOpen(false)}>
          <Box p={1} style={{ backgroundColor: '#fff', opacity: 0.75}}>
            <Subtitle>{team.meal.label} - <TeamNr {...team} /></Subtitle>
            <TeamCardDetails {...team}/>
          </Box>
        </InfoWindow>
      )}
    </>
  )
}


const TeamCardDetailRow = styled('div')( {
  display: 'flex',
  alignItems: 'baseline'
});
const TeamCardDetailRowMarginBottom = styled('div')( {
  display: 'flex',
  alignItems: 'baseline',
  mb: 1
});

function TeamCardDetails({hostTeamMember, meal}: DinnerRouteTeam) {
  return (
    <>
    <TeamCardDetailRowMarginBottom>
      <SmallTitle i18n="host"/>:&nbsp; <Span><Fullname {...hostTeamMember} /></Span>
    </TeamCardDetailRowMarginBottom>
    <SmallTitle i18n="address" gutterBottom={false}/>
    <TeamCardDetailRow>
      <Span gutterBottom={false}>{hostTeamMember.street}</Span>&nbsp;<Span gutterBottom={false}>{hostTeamMember.streetNr}</Span>
    </TeamCardDetailRow>
    <TeamCardDetailRowMarginBottom>
      <Span>{hostTeamMember.zip}</Span>&nbsp;<Span>{hostTeamMember.cityName}</Span>
    </TeamCardDetailRowMarginBottom>
    { isStringNotEmpty(hostTeamMember.addressRemarks) && <em>{hostTeamMember.addressRemarks}</em> }

    <TeamCardDetailRow>
      <SmallTitle i18n="time"/>:&nbsp; <Span><Time date={meal.time }/></Span>
    </TeamCardDetailRow>
    </>
  );
}

function WarningAlert() {

  const {t} = useTranslation('common');

  return (
    <Box mt={2}>
      <Alert severity="warning" variant="outlined">
        <AlertTitle>{t('attention')}</AlertTitle>
          {t('dinner_route_geocoding_warning')}
        </Alert>
    </Box>
  );
}
