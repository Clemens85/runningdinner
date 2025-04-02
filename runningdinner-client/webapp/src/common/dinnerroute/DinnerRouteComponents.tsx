import { Box, styled } from "@mui/system";
import { AfterPartyLocation, AfterPartyLocationHeadline, DinnerRouteTeam, Fullname, MealType, TeamNr, Time, getFullname, isArrayEmpty, isArrayNotEmpty, isDarkColor, isStringNotEmpty, useDisclosure } from "@runningdinner/shared";
import { SmallTitle, Span, Subtitle } from "../theme/typography/Tags";
import { uniq } from "lodash-es";
import LinkExtern from "../theme/LinkExtern";
import { useTranslation } from "react-i18next";
import { Alert, AlertTitle } from "@mui/material";
import { useGeoPosition } from "../hooks/GeoPositionHook";
import { AdvancedMarker, InfoWindow,  useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { AfterPartyLocationMapEntry, DinnerRouteTeamMapEntry, getMarkerLabel } from "@runningdinner/shared";
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import IcecreamIcon from '@mui/icons-material/Icecream';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import React from "react";

export const TeamCardDetailRow = styled('div')( {
  display: 'flex',
  alignItems: 'baseline'
});

export const TeamCardDetailRowMarginBottom = styled('div')( {
  display: 'flex',
  alignItems: 'baseline',
  mb: 1
});


export function getTeamLabel(team: DinnerRouteTeam, includeHostFullname: boolean) {
  if (includeHostFullname) {
    return <>Team #{team.teamNumber} ({team.meal.label}) - <Fullname {...team.hostTeamMember} /></>;
  } else {
    return <>Team #{team.teamNumber} ({team.meal.label})</>;
  }
}

interface TeamCardDetailsProps extends DinnerRouteTeam {
  isCurrentTeam: boolean;
}

export function TeamCardDetails({hostTeamMember, meal, contactInfo, isCurrentTeam}: TeamCardDetailsProps) {

  function renderContactInfo() {
    if (isArrayEmpty(contactInfo)) {
      return <Span>-</Span>;
    }

    const contactInfoUnique = uniq(contactInfo);

    return (
      <>
        { contactInfoUnique.map((mobileNumber: string, index: number) =>
          <React.Fragment key={mobileNumber}>{index > 0 ? <span>, &nbsp;</span> : ""}<LinkExtern href={`tel:${mobileNumber}`} title={mobileNumber}/></React.Fragment>)
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

type WarningAlertProps = {
  teamsWithUnresolvedGeocodings: DinnerRouteTeam[];
};

export function WarningAlert({teamsWithUnresolvedGeocodings}: WarningAlertProps) {

  const {t} = useTranslation('common');

  const show = isArrayNotEmpty(teamsWithUnresolvedGeocodings);
  const {isOpen, close, open} = useDisclosure(show);

  useEffect(() => {
    if (show) {
      open();
    }
    // eslint-disable-next-line
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <>
    { isOpen &&
      <Box mt={2} mb={2}>
        <Alert severity="warning" variant="outlined"  onClose={close} >
          <AlertTitle>{t('attention')}</AlertTitle>
            {t('dinner_route_geocoding_warning')}
            <ul>
              { teamsWithUnresolvedGeocodings.map(team => <li key={team.teamNumber}>{getTeamLabel(team, true)}</li>) }
            </ul>
          </Alert>
      </Box>
    }
    </>
  );
}


type CurrentPositionMarkerProps = {
  onError?: (error: string) => void;
}
export function CurrentPositionMarker({onError}: CurrentPositionMarkerProps) {

  const {longitude: currentPosLng, latitude: currentPosLat, error: currentPosError} = useGeoPosition(true, {enableHighAccuracy: true});

  useEffect(() => {
    if (currentPosError && onError) {
      onError(currentPosError);
    }
  }, [currentPosError, onError])

  if (currentPosError || !currentPosLat || !currentPosLng) {
    return null;
  }

  return (
    <AdvancedMarker position={{ lat: currentPosLat, lng: currentPosLng }}>
      <div
        style={{
          width: 16,
          height: 16,
          position: 'absolute',
          top: 0,
          left: 0,
          background: '#4285F4',
          border: '2px solid #fff',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
      </div>
    </AdvancedMarker>
  )
  
}

export function AfterPartyLocationCard(afterPartyLocation: AfterPartyLocation) {
  return (
    <Span>
      {getAfterPartyLocationIcon(12)} 
      <strong style={{ paddingLeft: '4px' }}><AfterPartyLocationHeadline {...afterPartyLocation} />: </strong>
      { isStringNotEmpty(afterPartyLocation.addressName) && <>{afterPartyLocation.addressName}, </> }
      <>{afterPartyLocation.street} {afterPartyLocation.streetNr}, {afterPartyLocation.zip} {afterPartyLocation.cityName}</>
      <>{ isStringNotEmpty(afterPartyLocation.addressRemarks) && <><br />{afterPartyLocation.addressRemarks}</> }</>
    </Span>
  );
}



type TeamMarkerInfoWindowContentProps = {
  isCurrentTeam: boolean;
  team: DinnerRouteTeam
};

export function TeamMarkerInfoWindowContent({team, isCurrentTeam}: TeamMarkerInfoWindowContentProps) {
  return (
    <Box p={1} style={{ backgroundColor: '#fff', opacity: 0.75}}>
      <Subtitle>{team.meal.label} - <TeamNr {...team} /></Subtitle>
      <TeamCardDetails {...team} isCurrentTeam={isCurrentTeam} />
    </Box>
  )
}

type TeamHostMarkerProps = {
  team: DinnerRouteTeamMapEntry;
  isCurrentTeam: boolean;
  teamLabel: string;
  scale?: number;
  zIndex?: number;
};

const MapEntryPin = styled("div", {
  shouldForwardProp: (prop) => prop !== "teamColor"
  // @ts-ignore
})(({ teamColor }) => ({

  backgroundColor: teamColor, 
  borderColor: '#000', 
  color: isDarkColor(teamColor) ? '#fff' : '#000',
  borderRadius: '8px',
  padding: '6px',
  '&:after': {
    content: `""`,
    position: "absolute",
    left: "50%",
    top: "100%",
    transform: "translate(-50%, 0)",
    width: 0,
    height: 0,
    borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent",
    borderTop: `8px solid ${teamColor}`
  }
}));

export function getMealTypeIcon(mealType: MealType, fontSize: number = 16) {
  if (mealType === MealType.APPETIZER) {
    return <SoupKitchenIcon sx={{ fontSize }}/>;
  } else if (mealType === MealType.DESSERT) {
    return <IcecreamIcon sx={{ fontSize }} />;
  }
  return <DinnerDiningIcon sx={{ fontSize }}/>;
}

export function getAfterPartyLocationIcon(fontSize: number = 16) {
  return <LocalBarIcon sx={{ fontSize }} />;
}

export function TeamHostMarker({team, isCurrentTeam, zIndex = 1}: TeamHostMarkerProps) {
  
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  // const glyphColor = isDarkColor(team.color) ? '#fff' : '#000';

  return (
    <>
      <AdvancedMarker 
        ref={markerRef}
        title={`Team ${team.teamNumber} - ${team.meal.label} (${getFullname(team.hostTeamMember)})`}
        onClick={() => setOpen(!open)}
        zIndex={zIndex + 1}
        position={{ lat: team.position.lat!, lng: team.position.lng! }}> 

          {/* @ts-ignore */}
          <MapEntryPin teamColor={team.color}>
            <>{getMealTypeIcon(team.mealType)}</>  
            {getMarkerLabel(`#${team.teamNumber}`)}
          </MapEntryPin>

          {/* <Box sx={{ 
            backgroundColor: team.color, 
            borderColor: '#000', 
            color: glyphColor,
            borderRadius: '8px',
            py: 1,
            px: 1
          }}>
            <>{getMealTypeIcon(team.mealType)}</>  
            {getMarkerLabel(`#${team.teamNumber}`)}
          </Box> */}

        {/* <Pin 
          scale={scale}
          background={team.color}
          glyphColor={glyphColor}
          borderColor={'#000'}>
            <span>
              <center>{getMarkerLabel(team.meal.label)}</center> <center>{teamLabel}</center>
            </span>
          </Pin> */}
      </AdvancedMarker>
      {open && (
        <InfoWindow
          anchor={marker}
          maxWidth={300}
          onCloseClick={() => setOpen(false)}>
            <TeamMarkerInfoWindowContent team={team} isCurrentTeam={isCurrentTeam} />
        </InfoWindow>
      )}
    </>
  )
}

export function AfterPartyLocationMarker(afterPartyLocationMapEntry: AfterPartyLocationMapEntry) {
  
  const [open, setOpen] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const {position, color, title} = afterPartyLocationMapEntry;

  return (
    <>
      <AdvancedMarker 
        ref={markerRef}
        title={title}
        onClick={() => setOpen(!open)}
        position={{ lat: position.lat!, lng: position.lng! }}> 
          {/* @ts-ignore */}
          <MapEntryPin teamColor={color}>
            {getAfterPartyLocationIcon()}
            {getMarkerLabel(title)}
          </MapEntryPin>

        {/* <Pin 
          scale={1.3}
          background={color}
          borderColor={'#000'}>
            <span><center>{getMarkerLabel(title)}</center></span>
          </Pin> */}
      </AdvancedMarker>
      {open && (
        <InfoWindow
          anchor={marker}
          maxWidth={300}
          onCloseClick={() => setOpen(false)}>
          <Box p={1} style={{ backgroundColor: '#fff', opacity: 0.75}}>
            <AfterPartyLocationCard {...afterPartyLocationMapEntry} />
          </Box>
        </InfoWindow>
      )}
    </>
  )
}

