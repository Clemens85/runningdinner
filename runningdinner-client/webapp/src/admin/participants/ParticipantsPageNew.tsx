import { BaseRunningDinnerProps, GENERIC_HTTP_ERROR, Participant, ParticipantList, ParticipantListable, concatParticipantList, findEntityById, findTeamPartnerWishInfoAsync, getAsHttpErrorOrDefault, isStringNotEmpty, useDisclosure, useFindParticipants } from "@runningdinner/shared";
import { useParams } from "react-router-dom";
import { ProgressBar } from "../../common/ProgressBar";
import { useEffect, useMemo, useState } from "react";
import { BackToListButton, useMasterDetailView } from "../../common/hooks/MasterDetailViewHook";
import { useIsBigTabletDevice } from "../../common/theme/CustomMediaQueryHook";
import NumberOfParticipants from "./list/NumberOfParticipants";
import ParticipantsListInfo from "./list/ParticipantsListInfo";
import { CREATE_NEW_PARTICIPANT_TEAM_PARTNER_WISH_ACTION } from "./teampartnerwish/TeamPartnerWishAction";
import { BrowserTitle } from "../../common/mainnavigation/BrowserTitle";
import { ParticipantSearchResult, ParticipantsListHeader } from "./list/ParticipantsListHeader";
import { Grid } from "@mui/material";
import ParticipantsListView from "./list/ParticipantsListView";
import ParticipantForm from "./form/ParticipantForm";
import { StickyActionButton } from "../../common/theme/StickyActionButton";
import { EmptyDetails } from "../common/EmptyDetails";
import { TeamPartnerWishDialog } from "./teampartnerwish/TeamPartnerWishDialog";

export function ParticipantsPageNew({runningDinner}: BaseRunningDinnerProps) {

  const params = useParams();
  const participantId = params.participantId;

  const {adminId} = runningDinner;
  const {error, 
          isFetching, 
          refetch,
          data: participantList} = useFindParticipants(adminId);

  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantListable>();
  const [showMiscNotes, setShowMiscNotes] = useState(false);

  const selectedParticipantFromUrl = useMemo(() => {
    const allParticipants = concatParticipantList(participantList);
    if (isStringNotEmpty(participantId)) {
      return findEntityById(allParticipants, participantId);
    }
  }, [participantList, participantId]);

  useEffect(() => {
    if (!selectedParticipant && selectedParticipantFromUrl) {
      setSelectedParticipant(selectedParticipantFromUrl);
    }
  }, [selectedParticipant, selectedParticipantFromUrl, setSelectedParticipant])

  if (isFetching || error) {
    const httpFetchError = error ? getAsHttpErrorOrDefault(error, GENERIC_HTTP_ERROR) : undefined;
    return <ProgressBar showLoadingProgress={isFetching} fetchError={httpFetchError} />;
  }

  if (participantList) {
    return <ParticipantsView runningDinner={runningDinner} 
                             onUpdateSelectedParticipant={setSelectedParticipant}
                             selectedParticipant={selectedParticipant}
                             showMiscNotes={showMiscNotes}
                             onUpdateShowMiscNotes={setShowMiscNotes}
                             participantList={participantList}
                             refetch={refetch}
                              />
  }
}

type ParticipantsViewProps = {
  participantList: ParticipantList;
  selectedParticipant?: ParticipantListable;
  onUpdateSelectedParticipant: (participant?: ParticipantListable) => unknown;
  showMiscNotes: boolean;
  onUpdateShowMiscNotes: (newVal: boolean) => unknown;
  refetch: () => unknown;
} & BaseRunningDinnerProps;

function ParticipantsView({runningDinner, participantList, onUpdateSelectedParticipant, selectedParticipant, showMiscNotes, onUpdateShowMiscNotes, refetch}: ParticipantsViewProps) {

  const {adminId} = runningDinner;

  const [participantSearchResult, setParticipantSearchResult] = useState<ParticipantSearchResult>({ hasSearchText: false, filteredParticipants: [] });

  const { isOpen: isTeamPartnerWishDialogOpen,
          close: closeTeamPartnerWishDialog,
          open: openTeamPartnerWishDialog,
          getIsOpenData: getTeamPartnerWishInfo } = useDisclosure(false);

  const {showBackToListViewButton, setShowDetailsView, showListView, showDetailsView} = useMasterDetailView();
  const isBigTablet = useIsBigTabletDevice();

  useEffect(() => {
    if (selectedParticipant) {
      editParticipant(selectedParticipant);
    }
  }, [selectedParticipant]);

  function editParticipant(participant: ParticipantListable) {
    onUpdateSelectedParticipant(participant);
    setShowDetailsView(true);
    window.scrollTo(0, 0);
  }

  function onNewParticipant() {
    onUpdateSelectedParticipant(undefined);
    setShowDetailsView(true);
    window.scrollTo(0, 0);
  }

  function onParticipantSaved(updatedParticipant: Participant) {
    findTeamPartnerWishInfoAsync(adminId, updatedParticipant)
        .then((teamPartnerWishInfo) => {
          if (teamPartnerWishInfo.relevant) {
            openTeamPartnerWishDialog(teamPartnerWishInfo);
          } else {
            handleParticipantChange();
          }
        });
  }

  const handleTeamPartnerWishDialogResult = (teamPartnerWishAction: any) => {
    closeTeamPartnerWishDialog();
    if (teamPartnerWishAction.type === CREATE_NEW_PARTICIPANT_TEAM_PARTNER_WISH_ACTION) {
      const newParticipant = teamPartnerWishAction.resultPayload; // Has only email and teamPartnerWish filled
      editParticipant(newParticipant);
    } else {
      handleParticipantChange();
    }
    // Other actions needs no treatment in here
  };

  function onParticipantDeleted(_deletedParticipant: Participant) {
    handleParticipantChange();
  }
  function handleParticipantChange() {
    setShowDetailsView(false);
    refetch();
  }

  function handleParticipantSearchChange(searchResult: ParticipantSearchResult) {
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
                                      participantList={participantList!}
                                      onShowMiscNotesChange={onUpdateShowMiscNotes}
                                      showMiscNotes={showMiscNotes}
                                      onParticipantSearchChanged={handleParticipantSearchChange} />
        }
        <Grid container spacing={2}>
          { showListView &&
            <Grid item xs={12} md={isBigTablet ? 12 : 7}>
              <ParticipantsListView participantsListInfo={participantsListInfo}
                                    participantList={participantList!}
                                    selectedParticipant={selectedParticipant}
                                    participantSearchResult={participantSearchResult}
                                    showMiscNotes={showMiscNotes}
                                    // @ts-ignore
                                    onReFetch={() => refetch()}
                                    onClick={editParticipant} />
            </Grid>
          }
          <Grid item xs={12} md={isBigTablet ? 12 : 5}>
            { showDetailsView
                ? <ParticipantForm participant={selectedParticipant!}
                                   participantList={participantList!}
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
}