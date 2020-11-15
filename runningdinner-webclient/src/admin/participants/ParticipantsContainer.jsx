import React, {useEffect, useState} from 'react'
import ParticipantsListHeader from "./list/ParticipantsListHeader";
import ParticipantsList from "./list/ParticipantsList";
import ParticipantService from "../../shared/admin/ParticipantService";
import {useParams} from "react-router-dom";
import {findEntityById} from "../../shared/Utils";
import ParticipantForm from "./form/ParticipantForm";
import { Grid, Box, useMediaQuery, useTheme, Button } from "@material-ui/core";
import {StickyActionButton} from "../../common/theme/StickyActionButton";
import NumberOfParticipants from "./list/NumberOfParticipants";
import ParticipantsListInfo from "./list/ParticipantsListInfo";
import {useTranslation} from "react-i18next";
import { Helmet } from 'react-helmet-async';
import {EmptyDetails} from "../common/EmptyDetails";
import Fetch from "../../common/Fetch";

export default function ParticipantsContainer({runningDinner}) {

  const params = useParams();
  const participantId = params.participantId;

  const {adminId} = runningDinner;

  return <Fetch asyncFunction={ParticipantService.findParticipantsAsync}
                parameters={[adminId]}
                render={result => <Participants runningDinner={runningDinner}
                                                incomingParticipants={result.participants}
                                                selectedParticipantId={participantId}
                                                reFetch={result.reFetch} />} />
};

const Participants = ({runningDinner, incomingParticipants, selectedParticipantId, reFetch}) => {

  const {t} = useTranslation(['admin', 'common']);

  const { adminId, sessionData } = runningDinner;

  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState();
  const [participants, setParticipants] = useState(incomingParticipants);
  const [hasSearchText, setHasSearchText] = useState(false);

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setParticipants(incomingParticipants);
    if (selectedParticipantId) {
      const foundSelectedParticipant = findEntityById(incomingParticipants, selectedParticipantId);
      if (foundSelectedParticipant) {
        editParticipant(foundSelectedParticipant);
      }
    }
  }, [incomingParticipants, selectedParticipantId]);

  function editParticipant(participant) {
    setSelectedParticipant(participant);
    setShowParticipantForm(true);
  }

  function onNewParticipant() {
    setSelectedParticipant(null);
    setShowParticipantForm(true);
    window.scrollTo(0, 0);
  }

  function onParticipantSaved(updatedParticipant) {
    handleParticipantChange();
  }
  function onParticipantDeleted(deletedParticipant) {
    handleParticipantChange();
  }
  function handleParticipantChange() {
    setShowParticipantForm(false);
    reFetch();
  }

  function handleParticipantSearchChange(searchResult) {
    setParticipants(searchResult.filteredParticiants);
    setHasSearchText(searchResult.hasSearchText);
  }

  const numberOfParticipants = <NumberOfParticipants participants={incomingParticipants} runningDinnerSessionData={sessionData} />;
  const participantsListInfo = <Box mb={3}>
                                  <ParticipantsListInfo participants={participants} runningDinnerSessionData={sessionData} hasSearchText={hasSearchText}/>
                               </Box>;

  const showParticipantsList = !isSmallDevice || !showParticipantForm;

  return (
      <>
        <Helmet>
          <title>{t('common:participants')}</title>
        </Helmet>
        <Box mb={2}>
          { !showParticipantsList
            ? <Button onClick={() => setShowParticipantForm(false)}>{t('common:back')}</Button>
            : <ParticipantsListHeader numberOfParticipants={numberOfParticipants}
                                      searchableParticipants={incomingParticipants}
                                      onParticipantSearchChanged={handleParticipantSearchChange} />
          }
        </Box>
        <Grid container spacing={2}>
          { showParticipantsList &&
            <Grid item xs={12} md={7}>
              <ParticipantsList participantsListInfo={participantsListInfo}
                                participants={participants}
                                selectedParticipant={selectedParticipant}
                                hasSearchText={hasSearchText}
                                onClick={editParticipant} />
            </Grid>
          }
          <Grid item xs={12} md={5}>
            { showParticipantForm
                ? <ParticipantForm participant={selectedParticipant}
                                   adminId={adminId}
                                   onParticipantSaved={onParticipantSaved}
                                   onParticipantDeleted={onParticipantDeleted} />
                : <EmptyDetails labelI18n='participant_empty_selection' />
            }
          </Grid>
        </Grid>
        <StickyActionButton onClick={onNewParticipant} />
      </>
  );
};
