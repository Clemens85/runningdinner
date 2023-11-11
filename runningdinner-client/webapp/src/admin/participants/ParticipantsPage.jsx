import React, {useEffect, useState} from 'react'
import { ParticipantsListHeader }  from "./list/ParticipantsListHeader";
import {useParams} from "react-router-dom";
import ParticipantForm from "./form/ParticipantForm";
import { Grid } from "@mui/material";
import {StickyActionButton} from "../../common/theme/StickyActionButton";
import NumberOfParticipants from "./list/NumberOfParticipants";
import ParticipantsListInfo from "./list/ParticipantsListInfo";
import {EmptyDetails} from "../common/EmptyDetails";
import { Fetch } from "../../common/Fetch";
import {TeamPartnerWishDialog} from "./teampartnerwish/TeamPartnerWishDialog";
import {
  CREATE_NEW_PARTICIPANT_TEAM_PARTNER_WISH_ACTION
} from "./teampartnerwish/TeamPartnerWishAction";
import {
  concatParticipantList,
  findEntityById,
  findParticipantsAsync,
  findTeamPartnerWishInfoAsync,
  useDisclosure
} from "@runningdinner/shared";
import {BackToListButton, useMasterDetailView} from "../../common/hooks/MasterDetailViewHook";
import {BrowserTitle} from "../../common/mainnavigation/BrowserTitle";
import ParticipantsListView from "./list/ParticipantsListView";
import { useCustomMediaQuery } from '../../common/theme/CustomMediaQueryHook';

export default function ParticipantsPage({runningDinner}) {

  const params = useParams();
  const participantId = params.participantId;

  const {adminId} = runningDinner;

  return <Fetch asyncFunction={findParticipantsAsync}
                parameters={[adminId]}
                render={resultObj => <ParticipantsView runningDinner={runningDinner}
                                                       participantList={resultObj.result}
                                                       selectedParticipantId={participantId}
                                                       reFetch={resultObj.reFetch} />} />
};

const ParticipantsView = ({runningDinner, participantList, selectedParticipantId, reFetch}) => {

  const { adminId } = runningDinner;

  const [selectedParticipant, setSelectedParticipant] = useState();
  const [participantSearchResult, setParticipantSearchResult] = useState({ hasSearchText: false, filteredParticipants: [] });
  const [showMiscNotes, setShowMiscNotes] = useState(false);

  const { isOpen: isTeamPartnerWishDialogOpen,
          close: closeTeamPartnerWishDialog,
          open: openTeamPartnerWishDialog,
          getIsOpenData: getTeamPartnerWishInfo } = useDisclosure(false);

  const {showBackToListViewButton, setShowDetailsView, showListView, showDetailsView} = useMasterDetailView();
  const {isBigTabletDevice} = useCustomMediaQuery();
  const isBigTablet = isBigTabletDevice();

  useEffect(() => {
    const allParticipants = concatParticipantList(participantList);
    // setParticipants(allParticipants);
    if (selectedParticipantId) {
      const foundSelectedParticipant = findEntityById(allParticipants, selectedParticipantId);
      if (foundSelectedParticipant) {
        editParticipant(foundSelectedParticipant);
      }
    }
    // eslint-disable-next-line
  }, [participantList, selectedParticipantId]);

  function editParticipant(participant) {
    setSelectedParticipant(participant);
    setShowDetailsView(true);
    window.scrollTo(0, 0);
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
    setParticipantSearchResult(searchResult);
  }

  const numberOfParticipants = <NumberOfParticipants participantList={participantList} />;
  const participantsListInfo = <ParticipantsListInfo participantList={participantList} hasSearchText={participantSearchResult.hasSearchText}/>;

  return (
      <>
        <BrowserTitle titleI18nKey={'common:participants'} namespaces={'common'} />
        { showBackToListViewButton
            ? <BackToListButton onBackToList={() => setShowDetailsView(false)} />
            : <ParticipantsListHeader adminId={adminId}
                                      numberOfParticipants={numberOfParticipants}
                                      participantList={participantList}
                                      onShowMiscNotesChange={(newVal) => setShowMiscNotes(newVal)}
                                      showMiscNotes={showMiscNotes}
                                      onParticipantSearchChanged={handleParticipantSearchChange} />
        }
        <Grid container spacing={2}>
          { showListView &&
            <Grid item xs={12} md={isBigTablet ? 12 : 7}>
              <ParticipantsListView participantsListInfo={participantsListInfo}
                                    participantList={participantList}
                                    selectedParticipant={selectedParticipant}
                                    participantSearchResult={participantSearchResult}
                                    showMiscNotes={showMiscNotes}
                                    onReFetch={reFetch}
                                    onClick={editParticipant} />
            </Grid>
          }
          <Grid item xs={12} md={isBigTablet ? 12 : 5}>
            { showDetailsView
                ? <ParticipantForm participant={selectedParticipant}
                                   participantList={participantList}
                                   adminId={adminId}
                                   teamPartnerWishDisabled={runningDinner.options.teamPartnerWishDisabled}
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
