import React, {useEffect, useState} from 'react'
import ParticipantsListHeader from "./list/ParticipantsListHeader";
import ParticipantsList from "./list/ParticipantsList";
import {useParams} from "react-router-dom";
import ParticipantForm from "./form/ParticipantForm";
import { Grid, Box } from "@material-ui/core";
import {StickyActionButton} from "../../common/theme/StickyActionButton";
import NumberOfParticipants from "./list/NumberOfParticipants";
import ParticipantsListInfo from "./list/ParticipantsListInfo";
import {useTranslation} from "react-i18next";
import { Helmet } from 'react-helmet-async';
import {EmptyDetails} from "../common/EmptyDetails";
import { Fetch } from "../../common/Fetch";
import {TeamPartnerWishDialog} from "./teampartnerwish/TeamPartnerWishDialog";
import {
  CREATE_NEW_PARTICIPANT_TEAM_PARTNER_WISH_ACTION
} from "./teampartnerwish/TeamPartnerWishAction";
import {findEntityById, findParticipantsAsync, findTeamPartnerWishInfoAsync, useDisclosure} from "@runningdinner/shared";
import {BackToListButton, useMasterDetailView} from "../../common/hooks/MasterDetailViewHook";

export default function ParticipantsContainer({runningDinner}) {

  const params = useParams();
  const participantId = params.participantId;

  const {adminId} = runningDinner;

  return <Fetch asyncFunction={findParticipantsAsync}
                parameters={[adminId]}
                render={resultObj => <Participants runningDinner={runningDinner}
                                                   incomingParticipants={resultObj.result}
                                                   selectedParticipantId={participantId}
                                                   reFetch={resultObj.reFetch} />} />
};

const Participants = ({runningDinner, incomingParticipants, selectedParticipantId, reFetch}) => {

  const {t} = useTranslation(['admin', 'common']);

  const { adminId, sessionData } = runningDinner;

  const [selectedParticipant, setSelectedParticipant] = useState();
  const [participants, setParticipants] = useState(incomingParticipants);
  const [hasSearchText, setHasSearchText] = useState(false);

  const { isOpen: isTeamPartnerWishDialogOpen,
          close: closeTeamPartnerWishDialog,
          open: openTeamPartnerWishDialog,
          getIsOpenData: getTeamPartnerWishInfo } = useDisclosure(false);

  const {showBackToListViewButton, setShowDetailsView, showListView, showDetailsView} = useMasterDetailView();

  useEffect(() => {
    setParticipants(incomingParticipants);
    if (selectedParticipantId) {
      const foundSelectedParticipant = findEntityById(incomingParticipants, selectedParticipantId);
      if (foundSelectedParticipant) {
        editParticipant(foundSelectedParticipant);
      }
    }
    // eslint-disable-next-line
  }, [incomingParticipants, selectedParticipantId]);

  function editParticipant(participant) {
    setSelectedParticipant(participant);
    setShowDetailsView(true);
  }

  function onNewParticipant() {
    setSelectedParticipant(null);
    setShowDetailsView(true);
    window.scrollTo(0, 0);
  }

  function onParticipantSaved(updatedParticipant) {
    findTeamPartnerWishInfoAsync(adminId, updatedParticipant)
        .then((teamPartnerWishInfo) => {
          if (teamPartnerWishInfo.relevant) {
            openTeamPartnerWishDialog(teamPartnerWishInfo);
          } else {
            handleParticipantChange();
          }
        });
  }

  const handleTeamPartnerWishDialogResult = (teamPartnerWishAction) => {
    closeTeamPartnerWishDialog();
    if (teamPartnerWishAction.type === CREATE_NEW_PARTICIPANT_TEAM_PARTNER_WISH_ACTION) {
      const newParticipant = teamPartnerWishAction.resultPayload; // Has only email and teamPartnerWish filled
      editParticipant(newParticipant);
    } else {
      handleParticipantChange();
    }
    // Other actions needs no treatment in here
  };

  function onParticipantDeleted(deletedParticipant) {
    handleParticipantChange();
  }
  function handleParticipantChange() {
    setShowDetailsView(false);
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

  return (
      <>
        <Helmet>
          <title>{t('common:participants')}</title>
        </Helmet>
        { showBackToListViewButton
            ? <BackToListButton onBackToList={() => setShowDetailsView(false)} />
            : <ParticipantsListHeader adminId={adminId}
                                      numberOfParticipants={numberOfParticipants}
                                      searchableParticipants={incomingParticipants}
                                      onParticipantSearchChanged={handleParticipantSearchChange} />
        }
        <Grid container spacing={2}>
          { showListView &&
            <Grid item xs={12} md={7}>
              <ParticipantsList participantsListInfo={participantsListInfo}
                                participants={participants}
                                selectedParticipant={selectedParticipant}
                                hasSearchText={hasSearchText}
                                onClick={editParticipant} />
            </Grid>
          }
          <Grid item xs={12} md={5}>
            { showDetailsView
                ? <ParticipantForm participant={selectedParticipant}
                                   adminId={adminId}
                                   onParticipantSaved={onParticipantSaved}
                                   onParticipantDeleted={onParticipantDeleted} />
                : <EmptyDetails labelI18n='participant_empty_selection' />
            }
          </Grid>
        </Grid>
        <StickyActionButton onClick={onNewParticipant} />
        { isTeamPartnerWishDialogOpen && <TeamPartnerWishDialog runningDinner={runningDinner}
                                                                isOpen={isTeamPartnerWishDialogOpen}
                                                                onClose={handleTeamPartnerWishDialogResult}
                                                                teamPartnerWishInfo={getTeamPartnerWishInfo()} /> }
      </>
  );
};
