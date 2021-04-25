import React from 'react';
import {
  createMarkerIconUrl,
  DinnerRoute,
  DinnerRouteTeam,
  filterDinnerRouteTeamsForValidGeocdingResults,
  Fullname,
  getCenterPosition, getFullname, isGeocdingResultValidForAllTeams,
  isSameDinnerRouteTeam,
  isStringNotEmpty,
  TeamStatus,
  Time,
  useGeocoder,
  useTeamName
} from "@runningdinner/shared";
import {Box, LinearProgress, makeStyles, Typography} from '@material-ui/core';
import {SpacingGrid} from '../theme/SpacingGrid';
import {PageTitle, SmallTitle, Span, Subtitle} from '../theme/typography/Tags';
import {useTranslation} from "react-i18next";
import { SpacingPaper } from '../theme/SpacingPaper';
import clsx from "clsx";
import {GoogleMap, InfoWindow, Marker, Polyline} from '@react-google-maps/api';
import {LoadScript} from "@react-google-maps/api";
import { cloneDeep } from 'lodash';
// @ts-ignore
import useGeolocation from 'react-hook-geolocation'
import Alert from "@material-ui/lab/Alert";
import {AlertTitle} from "@material-ui/lab";

export interface DinnerRouteProps {
  dinnerRoute: DinnerRoute
}

export default function DinnerRouteView({dinnerRoute}: DinnerRouteProps) {

  const {mealSpecificsOfGuestTeams, teams} = dinnerRoute;

  const teamCardNodes = teams.map((team, index) =>
    <SpacingGrid item xs={12} md={4} key={team.teamNumber}>
      <TeamCard dinnerRouteTeam={team}
                isCurrentTeam={team.teamNumber === dinnerRoute.currentTeam.teamNumber}
                positionInRoute={index + 1}/>
    </SpacingGrid>
  );

  return (
      <SpacingGrid container>
        { isStringNotEmpty(mealSpecificsOfGuestTeams) &&
          <SpacingGrid item xs={12} mb={2}>
            <Subtitle>{mealSpecificsOfGuestTeams}</Subtitle>
          </SpacingGrid>
        }
        <SpacingGrid container mb={2} spacing={4}>
          {teamCardNodes}
        </SpacingGrid>
        <SpacingGrid item xs={12} mb={2}>
          <MapContainer dinnerRoute={dinnerRoute} />
        </SpacingGrid>
      </SpacingGrid>
  );
}

interface TeamCardProps {
  dinnerRouteTeam: DinnerRouteTeam;
  positionInRoute: number;
  isCurrentTeam: boolean;
}


const useTeamCardStyles = makeStyles((theme) => ({
  teamCardLine: {
    display: 'flex',
    alignItems: 'baseline',
  },
  marginBottom: {
    marginBottom: theme.spacing(1)
  }
}));


function TeamCard({dinnerRouteTeam, positionInRoute, isCurrentTeam}: TeamCardProps) {

  const {t} = useTranslation(['common']);
  const isCancelled = dinnerRouteTeam.status === TeamStatus.CANCELLED;

  return (
    <>
      <PageTitle color={isCurrentTeam ? "primary" : "textSecondary"}>
        ({positionInRoute}) {dinnerRouteTeam.meal.label}
        { isCurrentTeam && <Box component={"span"} pl={1}>
                              <Typography variant={"body2"} component={"span"}>{t('common:with_you')}</Typography>
                           </Box> }
      </PageTitle>
      <SpacingPaper elevation={3} p={2}>
        {isCancelled && <Subtitle i18n={"cancelled"} />}
        {!isCancelled && <TeamCardDetails {...dinnerRouteTeam} /> }
      </SpacingPaper>
    </>
  );
}

function TeamCardDetails({hostTeamMember, meal}: DinnerRouteTeam) {

  const teamCardClasses = useTeamCardStyles();

  return (
    <>
      <div className={clsx(teamCardClasses.teamCardLine, teamCardClasses.marginBottom)}>
        <SmallTitle i18n="host"/>:&nbsp; <Span><Fullname {...hostTeamMember} /></Span>
      </div>
      <SmallTitle i18n="address" gutterBottom={false}/>
      <div className={teamCardClasses.teamCardLine}>
        <Span gutterBottom={false}>{hostTeamMember.street}</Span>&nbsp;<Span gutterBottom={false}>{hostTeamMember.streetNr}</Span>
      </div>
      <div className={clsx(teamCardClasses.teamCardLine, teamCardClasses.marginBottom)}>
        <Span>{hostTeamMember.zip}</Span>&nbsp;<Span>{hostTeamMember.cityName}</Span>
      </div>
      { isStringNotEmpty(hostTeamMember.addressRemarks) && <em>{hostTeamMember.addressRemarks}</em> }
      <div className={teamCardClasses.teamCardLine}>
        <SmallTitle i18n="time"/>: &nbsp; <Span><Time date={meal.time }/></Span>
      </div>
    </>
  )
}


// https://github.com/JustFly1984/react-google-maps-api/tree/master/packages/react-google-maps-api
function MapContainer({dinnerRoute}: DinnerRouteProps) {

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY_JS || "";
  const { i18n } = useTranslation();
  const {getGeocodePositionsOfTeamHosts} = useGeocoder(googleMapsApiKey, i18n.language);

  const [resolvedDinnerRouteTeams, setResolvedDinnerRouteTeams] = React.useState<DinnerRouteTeam[]>();

  React.useEffect(() => {
    getGeocodePositionsOfTeamHosts(dinnerRoute.teams)
        .then(result => setResolvedDinnerRouteTeams(result));
    // eslint-disable-next-line
  }, [dinnerRoute]);

  if (!resolvedDinnerRouteTeams) {
    return <LinearProgress color="secondary" />;
  }
  return <MapView dinnerRouteTeams={resolvedDinnerRouteTeams}
                  currentTeam={dinnerRoute.currentTeam}
                  googleMapsApiKey={googleMapsApiKey}/>;
}

interface MapViewProps {
  dinnerRouteTeams: DinnerRouteTeam[];
  currentTeam: DinnerRouteTeam;
  googleMapsApiKey: string;
}
const polyLineOptionsTemplate = {
  strokeColor: "#286090",
  strokeOpacity: "1.0",
  strokeWeight: 2,
  zIndex: 1
};

interface DinnerRouteTeamMarkerInfoState {
  dinnerRouteTeam: DinnerRouteTeam;
  opened?: boolean;
  content?: React.ReactNode;
}

// TODO: Use https://github.com/rehooks/window-size/blob/master/index.js and https://github.com/tranbathanhtung/usePosition/blob/master/index.js for
// dynamically calculating map height
function MapView({dinnerRouteTeams, currentTeam, googleMapsApiKey}: MapViewProps) {

  const {getTeamName} = useTeamName();
  const {t} = useTranslation('common');

  console.log(`Running though MapView`);

  // const [currentLocation, setCurrentLocation] = React.useState<any>();
  // useGeolocation({enableHighAccuracy: true}, (updatedGeoLocation: any) => {
  //   setCurrentLocation(updatedGeoLocation);
  // });
  // TODO: The code above causes lots of re-renders
  const currentLocation = {
    error: "asdf",
    latitude: 0,
    longitude: 0

  };

  const [dinnerRouteTeamMarkerInfoState, setDinnerRouteTeamMarkerInfoState] = React.useState<DinnerRouteTeamMarkerInfoState[]>(
      dinnerRouteTeams.map(dinnerRouteTeam => {return {dinnerRouteTeam}; })
  );

  function isCurrentTeam(dinnerRouteTeam: DinnerRouteTeam) {
    return isSameDinnerRouteTeam(currentTeam, dinnerRouteTeam);
  }

  function renderInfoWindowContent(dinnerRouteTeam: DinnerRouteTeam) {
    return (
      <>
        <Subtitle>{dinnerRouteTeam.meal.label}</Subtitle>
        <TeamCardDetails {...dinnerRouteTeam}/>
      </>
    );
  }

  const handleMarkerClick = (dinnerRouteTeam: DinnerRouteTeam) => {
    const newState = cloneDeep(dinnerRouteTeamMarkerInfoState);
    const foundMarkerInfoState = newState.filter(obj => isSameDinnerRouteTeam(obj.dinnerRouteTeam, dinnerRouteTeam));
    if (foundMarkerInfoState.length === 0) {
      console.log(`Could not find marker in ${newState} for ${JSON.stringify(dinnerRouteTeam)}`);
      return;
    }
    newState.forEach(markerInfoState => markerInfoState.opened = false);
    foundMarkerInfoState[0].content = renderInfoWindowContent(dinnerRouteTeam);
    foundMarkerInfoState[0].opened = true;
    setDinnerRouteTeamMarkerInfoState(newState);
  };

  const handleInfoCloseClicked = () => {
    const newState = cloneDeep(dinnerRouteTeamMarkerInfoState);
    newState.forEach(markerInfoState => markerInfoState.opened = false); // This is currently okay due to we have always max. one opened so far
    setDinnerRouteTeamMarkerInfoState(newState);
  };

  const getDinnerRouteTeamMarkerInfoToShow = () : DinnerRouteTeamMarkerInfoState | undefined => {
    const resultArr = dinnerRouteTeamMarkerInfoState.filter(obj => obj.opened);
    return resultArr.length > 0 ? resultArr[0] : undefined;
  }

  const markerNodes = filterDinnerRouteTeamsForValidGeocdingResults(dinnerRouteTeams)
                        .map((dinnerRouteTeam, index) => <Marker position={dinnerRouteTeam.geocodingResult}
                                                                                        title={`${getTeamName(dinnerRouteTeam)} (${getFullname(dinnerRouteTeam.hostTeamMember)})`}
                                                                                        onClick={() => handleMarkerClick(dinnerRouteTeam)}
                                                                                        key={dinnerRouteTeam.teamNumber}
                                                                                        icon={createMarkerIconUrl(index + 1, isCurrentTeam(dinnerRouteTeam))}/>);

  const centerPosition = getCenterPosition(dinnerRouteTeams, currentTeam);

  const paths = filterDinnerRouteTeamsForValidGeocdingResults(dinnerRouteTeams)
                  .map(dinnerRouteTeam => dinnerRouteTeam.geocodingResult);
  const polyLineOptions = { ...polyLineOptionsTemplate, paths };

  const dinnerRouteTeamMarkerInfoToShow = getDinnerRouteTeamMarkerInfoToShow();

  const infoWindowOptions = {
    pixelOffset: { width: -8, height: -36 }
  };

  const showWarnings = currentLocation?.error || !isGeocdingResultValidForAllTeams(dinnerRouteTeams);

  return (
      <>
        <Box>
          <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <GoogleMap
                mapContainerStyle={{height: '400px'}}
                center={centerPosition}
                zoom={13}>
              { markerNodes }
              {currentLocation && !currentLocation?.error &&
                <Marker animation="DROP"
                        icon={"http://www.robotwoods.com/dev/misc/bluecircle.png"}
                        position={{ lat: currentLocation?.latitude, lng: currentLocation?.longitude }} />
              }
              <Polyline options={polyLineOptions} path={paths} />
              { dinnerRouteTeamMarkerInfoToShow &&
                  <InfoWindow position={dinnerRouteTeamMarkerInfoToShow.dinnerRouteTeam.geocodingResult}
                              options={infoWindowOptions}
                              onCloseClick={handleInfoCloseClicked}>
                    <Box p={1} style={{ backgroundColor: '#fff', opacity: 0.75}}>
                      {dinnerRouteTeamMarkerInfoToShow.content}
                    </Box>
                  </InfoWindow> }
            </GoogleMap>
          </LoadScript>
        </Box>
        { showWarnings &&  <Box mt={2}>
                              <Alert severity="warning" variant="outlined">
                                <AlertTitle>{t('attention')}</AlertTitle>
                                {t('dinner_route_geocoding_warning')}
                              </Alert>
                           </Box>}
      </>
  );
}
