import React, { useRef } from 'react';
import {
  AFTER_PARTY_LOCATION_MARKER_NUMBER,
  AfterPartyLocation,
  createMarkerIconUrl,
  DinnerRoute,
  DinnerRouteTeam,
  Fullname,
  getCenterPosition,
  getFullname,
  getGeocodingResultsForTeamsAndAfterPartyLocation,
  isAfterPartyLocationDefined,
  isArrayEmpty, isArrayNotEmpty,
  isDinnerRouteTeam,
  isGeocdingResultValidForAllTeams,
  isGeocodingResultValid,
  isSameDinnerRouteTeam,
  isStringNotEmpty,
  Team,
  TeamStatus,
  Time,
  useGeocoder,
  useTeamName,
  AfterPartyLocationHeadline
} from "@runningdinner/shared";
import {Box, Grid, LinearProgress, Paper, Typography} from '@mui/material';
import {PageTitle, SmallTitle, Span, Subtitle} from '../theme/typography/Tags';
import {useTranslation} from "react-i18next";
import {GoogleMap, InfoWindow, Marker, Polyline} from '@react-google-maps/api';
import {LoadScript} from "@react-google-maps/api";
import { cloneDeep, uniq } from 'lodash-es';
import Alert from '@mui/material/Alert';
import { AlertTitle } from '@mui/material';
import {useGeoPosition} from "../hooks/GeoPositionHook";
import {useDynamicFullscreenHeight} from "../hooks/DynamicFullscreenHeightHook";
import LinkExtern from '../theme/LinkExtern';
import {TextViewHtml} from "../TextViewHtml";
import {SuperSEO} from "react-super-seo";
import {styled} from "@mui/material/styles";

export interface DinnerRouteProps {
  dinnerRoute: DinnerRoute
}

export default function DinnerRouteView({dinnerRoute}: DinnerRouteProps) {

  const {mealSpecificsOfGuestTeams, teams, afterPartyLocation} = dinnerRoute;

  const teamCardNodes = teams.map((team, index) =>
    <Grid item xs={12} md={4} key={team.teamNumber}>
      <TeamCard dinnerRouteTeam={team}
                isCurrentTeam={team.teamNumber === dinnerRoute.currentTeam.teamNumber}
                positionInRoute={index + 1}/>
    </Grid>
  );

  return (
      <>
        <Grid container>
          { isStringNotEmpty(mealSpecificsOfGuestTeams) &&
            <Grid item xs={12} sx={{ mb: 2 }}>
              <Subtitle><TextViewHtml text={mealSpecificsOfGuestTeams} /></Subtitle>
            </Grid>
          }
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {teamCardNodes}
          </Grid>
          { afterPartyLocation && isAfterPartyLocationDefined(afterPartyLocation) &&
            <Grid container spacing={4}  sx={{ mb: 1 }}>
              <Grid item xs={12}>
                <AfterPartyLocationCard {...afterPartyLocation} />
              </Grid>
            </Grid>
          }
          <Grid item xs={12} sx={{ mb: 2 }}>
            <MapContainer dinnerRoute={dinnerRoute} />
          </Grid>
        </Grid>
        <SuperSEO title={"Run Your Dinner - Dinner Route"} />
      </>
  );
}

interface TeamCardProps {
  dinnerRouteTeam: DinnerRouteTeam;
  positionInRoute: number;
  isCurrentTeam: boolean;
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


function TeamCard({dinnerRouteTeam, positionInRoute, isCurrentTeam}: TeamCardProps) {

  const {t} = useTranslation(['common']);
  const isCancelled = dinnerRouteTeam.status === TeamStatus.CANCELLED;

  let teamTitleColor = isCurrentTeam ? "primary" : "textSecondary";
  if (isCancelled) {
    teamTitleColor = "error";
  }

  return (
    <>
      <PageTitle color={teamTitleColor}>
        ({positionInRoute}) {dinnerRouteTeam.meal.label}
        { isCurrentTeam && <Box component={"span"} pl={1}>
                              <Typography variant={"body2"} component={"span"}>{t('common:with_you')}</Typography>
                           </Box> }
      </PageTitle>
      <Paper elevation={3} sx={{ p:2 }}>
        {isCancelled && <Subtitle i18n={"cancelled"} color="error" />}
        {!isCancelled && <TeamCardDetails {...dinnerRouteTeam} isCurrentTeam={isCurrentTeam} /> }
      </Paper>
    </>
  );
}

function AfterPartyLocationCard(afterPartyLocation: AfterPartyLocation) {
  return (
    <Span>
      <strong><AfterPartyLocationHeadline {...afterPartyLocation} />: </strong>
      { isStringNotEmpty(afterPartyLocation.addressName) && <>{afterPartyLocation.addressName}, </> }
      <>{afterPartyLocation.street} {afterPartyLocation.streetNr}, {afterPartyLocation.zip} {afterPartyLocation.cityName}</>
      <>{ isStringNotEmpty(afterPartyLocation.addressRemarks) && <><br />{afterPartyLocation.addressRemarks}</> }</>
    </Span>
  );
}


interface TeamCardDetailsProps extends DinnerRouteTeam {
  isCurrentTeam: boolean;
}

function TeamCardDetails({hostTeamMember, meal, contactInfo, isCurrentTeam}: TeamCardDetailsProps) {

  function renderContactInfo() {
    if (isArrayEmpty(contactInfo)) {
      return <Span>-</Span>;
    }

    const contactInfoUnique = uniq(contactInfo);

    return (
      <>
        { contactInfoUnique.map((mobileNumber: string, index: number) => 
            <>{index > 0 ? <span>, &nbsp;</span> : ""}<LinkExtern href={`tel:${mobileNumber}`} key={mobileNumber} title={mobileNumber}/></>)
        }
      </>
    );
  }

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

      <TeamCardDetailRowMarginBottom style={{ visibility: isCurrentTeam ? "hidden" : "visible" }}>
        <SmallTitle i18n="contact"/>:&nbsp; { renderContactInfo() }
      </TeamCardDetailRowMarginBottom>
    </>
  )
}

// See https://github.com/JustFly1984/react-google-maps-api/tree/master/packages/react-google-maps-api
function MapContainer({dinnerRoute}: DinnerRouteProps) {

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY_JS || "";
  const { i18n } = useTranslation();
  const {getGeocodePositionsOfTeamHosts, getGeocodePositionOfAfterPartyLocation} = useGeocoder(googleMapsApiKey, i18n.language);

  const [resolvedDinnerRouteTeams, setResolvedDinnerRouteTeams] = React.useState<DinnerRouteTeam[]>();
  const [resolvedAfterPartyLocation, setResolvedAfterPartyLocation] = React.useState<AfterPartyLocation | undefined>();

  function areAllGeocodesResolved() {
    const isAfterPartyLocationResolved = !isAfterPartyLocationDefined(dinnerRoute.afterPartyLocation) || resolvedAfterPartyLocation;
    return isArrayNotEmpty(resolvedDinnerRouteTeams) && isAfterPartyLocationResolved;
  }

  React.useEffect(() => {
    getGeocodePositionsOfTeamHosts(dinnerRoute.teams)
        .then(result => setResolvedDinnerRouteTeams(result));
    getGeocodePositionOfAfterPartyLocation(dinnerRoute.afterPartyLocation)
      .then(result => setResolvedAfterPartyLocation(result));
    // eslint-disable-next-line
  }, [dinnerRoute]);

  if (!areAllGeocodesResolved() || !resolvedDinnerRouteTeams) { // Second clause (!resolvedDinnerRouteTeams is needed for TS compiler...)
    return <LinearProgress color="secondary" />;
  }
  return <MapView dinnerRouteTeams={resolvedDinnerRouteTeams}
                  currentTeam={dinnerRoute.currentTeam}
                  afterPartyLocation={resolvedAfterPartyLocation}
                  googleMapsApiKey={googleMapsApiKey}/>;
}

interface MapViewProps {
  dinnerRouteTeams: DinnerRouteTeam[];
  currentTeam: Team;
  afterPartyLocation?: AfterPartyLocation;
  googleMapsApiKey: string;
}
const polyLineOptionsTemplate = {
  strokeColor: "#286090",
  strokeOpacity: "1.0",
  strokeWeight: 2,
  zIndex: 1
};

interface DinnerRouteItemMarkerInfoState {
  item: DinnerRouteTeam | AfterPartyLocation;
  opened?: boolean;
  content?: React.ReactNode;
}

function initDinnerRouteItemMarkerInfoStates(dinnerRouteTeams: DinnerRouteTeam[], afterPartyLocation?: AfterPartyLocation): DinnerRouteItemMarkerInfoState[] {
  const result: DinnerRouteItemMarkerInfoState[] = dinnerRouteTeams.map(dinnerRouteTeam => {return {item: dinnerRouteTeam}; });
  if (afterPartyLocation && isAfterPartyLocationDefined(afterPartyLocation)) {
    result.push({
      item: afterPartyLocation
    });
  }
  return result;
}

function MapView({dinnerRouteTeams, currentTeam, afterPartyLocation, googleMapsApiKey}: MapViewProps) {

  const {getTeamName} = useTeamName();
  const {t} = useTranslation('common');

  const {longitude: currentPosLng, latitude: currentPosLat, error: currentPosError} = useGeoPosition(true, {enableHighAccuracy: true});

  const [dinnerRouteItemMarkerInfoState, setDinnerRouteItemMarkerInfoState] = React.useState<DinnerRouteItemMarkerInfoState[]>(
    initDinnerRouteItemMarkerInfoStates(dinnerRouteTeams, afterPartyLocation)
  );

  const mapContainerRef = useRef(null);
  const mapHeight = useDynamicFullscreenHeight(mapContainerRef, 400);

  function isCurrentTeam(dinnerRouteTeam: DinnerRouteTeam) {
    return isSameDinnerRouteTeam(currentTeam, dinnerRouteTeam);
  }

  function renderInfoWindowContent(dinnerRouteTeam: DinnerRouteTeam) {
    return (
      <>
        <Subtitle>{dinnerRouteTeam.meal.label}</Subtitle>
        <TeamCardDetails {...dinnerRouteTeam} isCurrentTeam={isCurrentTeam(dinnerRouteTeam)}/>
      </>
    );
  }

  const handleMarkerClick = (item: DinnerRouteTeam | AfterPartyLocation) => {
    const newState = cloneDeep(dinnerRouteItemMarkerInfoState);

    let foundMarkerInfoState: DinnerRouteItemMarkerInfoState[];
    if (isDinnerRouteTeam(item)) {
      foundMarkerInfoState = newState.filter(obj => isDinnerRouteTeam(obj.item) && isSameDinnerRouteTeam(obj.item, item));
      if (foundMarkerInfoState.length === 0) {
        console.log(`Could not find marker in ${newState} for ${JSON.stringify(item)}`);
        return;
      }
      foundMarkerInfoState[0].content = renderInfoWindowContent(item);
    } else {
      foundMarkerInfoState = newState.filter(obj => !isDinnerRouteTeam(obj.item));
      if (foundMarkerInfoState.length === 0) {
        console.log(`Could not find marker in ${newState} for ${JSON.stringify(item)}`);
        return;
      }
      foundMarkerInfoState[0].content = <AfterPartyLocationCard {...item} />;
    }

    newState.forEach(markerInfoState => markerInfoState.opened = false);
    foundMarkerInfoState[0].opened = true;
    setDinnerRouteItemMarkerInfoState(newState);
  };

  const handleInfoCloseClicked = () => {
    const newState = cloneDeep(dinnerRouteItemMarkerInfoState);
    newState.forEach(markerInfoState => markerInfoState.opened = false); // This is currently okay due to we have always max. one opened so far
    setDinnerRouteItemMarkerInfoState(newState);
  };

  const getDinnerRouteItemMarkerInfoToShow = () : DinnerRouteItemMarkerInfoState | undefined => {
    const resultArr = dinnerRouteItemMarkerInfoState.filter(obj => obj.opened);
    return resultArr.length > 0 ? resultArr[0] : undefined;
  };

  function createAfterPartyLocationMarker() {
    if (!afterPartyLocation || !isAfterPartyLocationDefined(afterPartyLocation)) {
      return undefined;
    }
    return <Marker position={afterPartyLocation.geocodingResult}
                   title={afterPartyLocation.title}
                   onClick={() => handleMarkerClick(afterPartyLocation)}
                   icon={createMarkerIconUrl(AFTER_PARTY_LOCATION_MARKER_NUMBER, false)}/>;
  }

  function createTeamMarkers() {
    const result = [];
    for (let index = 0; index < dinnerRouteTeams.length; index++) {
      const dinnerRouteTeam = dinnerRouteTeams[index];
      if (!isGeocodingResultValid(dinnerRouteTeam.geocodingResult)) {
        continue;
      }
      result.push(
        <Marker position={dinnerRouteTeam.geocodingResult}
                title={`${getTeamName(dinnerRouteTeam)} (${getFullname(dinnerRouteTeam.hostTeamMember)})`}
                onClick={() => handleMarkerClick(dinnerRouteTeam)}
                key={dinnerRouteTeam.teamNumber}
                icon={createMarkerIconUrl(`${index + 1}`, isCurrentTeam(dinnerRouteTeam))}/>
      );
    }
    return result;
  }

  const teamMarkerNodes = createTeamMarkers();
  const afterPartyLocationMarkerNode = createAfterPartyLocationMarker();

  const centerPosition = getCenterPosition(dinnerRouteTeams, currentTeam);

  const paths = getGeocodingResultsForTeamsAndAfterPartyLocation(dinnerRouteTeams, afterPartyLocation);
  const polyLineOptions = { ...polyLineOptionsTemplate, paths };

  const dinnerRouteItemMarkerInfoToShow = getDinnerRouteItemMarkerInfoToShow();

  const infoWindowOptions = {
    pixelOffset: { width: -8, height: -36 }
  };

  const showWarnings = currentPosError || !isGeocdingResultValidForAllTeams(dinnerRouteTeams);

  return (
      <>
        <div ref={mapContainerRef}>
          <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <GoogleMap
                mapContainerStyle={{height: `${mapHeight}px`}}
                center={centerPosition}
                zoom={13}>
              { teamMarkerNodes }
              { afterPartyLocationMarkerNode }
              {currentPosLat && currentPosLng && !currentPosError &&
                <Marker animation="DROP"
                        icon={"http://www.robotwoods.com/dev/misc/bluecircle.png"}
                        position={{ lat: currentPosLat, lng: currentPosLng }} />
              }
              <Polyline options={polyLineOptions} path={paths} />
              { dinnerRouteItemMarkerInfoToShow &&
                  <InfoWindow position={dinnerRouteItemMarkerInfoToShow.item.geocodingResult}
                              options={infoWindowOptions}
                              onCloseClick={handleInfoCloseClicked}>
                    <Box p={1} style={{ backgroundColor: '#fff', opacity: 0.75}}>
                      {dinnerRouteItemMarkerInfoToShow.content}
                    </Box>
                  </InfoWindow> }
            </GoogleMap>
          </LoadScript>
        </div>
        { showWarnings &&  <Box mt={2}>
                              <Alert severity="warning" variant="outlined">
                                <AlertTitle>{t('attention')}</AlertTitle>
                                {t('dinner_route_geocoding_warning')}
                              </Alert>
                           </Box>}
      </>
  );
}
