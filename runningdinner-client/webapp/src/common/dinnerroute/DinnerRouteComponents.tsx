import { Box, styled } from "@mui/system";
import { AfterPartyLocation, AfterPartyLocationHeadline, DinnerRouteTeam, Fullname, TeamNr, Time, isArrayEmpty, isStringNotEmpty } from "@runningdinner/shared";
import { SmallTitle, Span, Subtitle } from "../theme/typography/Tags";
import { uniq } from "lodash-es";
import LinkExtern from "../theme/LinkExtern";
import { useTranslation } from "react-i18next";
import { Alert, AlertTitle } from "@mui/material";
import { useGeoPosition } from "../hooks/GeoPositionHook";
import { AdvancedMarker, InfoWindow, Pin, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { AfterPartyLocationMapEntry, getMarkerLabel } from "./DinnerRouteMapCalculationService";

export const TeamCardDetailRow = styled('div')( {
  display: 'flex',
  alignItems: 'baseline'
});

export const TeamCardDetailRowMarginBottom = styled('div')( {
  display: 'flex',
  alignItems: 'baseline',
  mb: 1
});


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

export function WarningAlert() {

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
      <strong><AfterPartyLocationHeadline {...afterPartyLocation} />: </strong>
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
        <Pin 
          scale={1.3}
          background={color}
          borderColor={'#000'}>
            <span><center>{getMarkerLabel(title)}</center></span>
          </Pin>
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