import React, {useEffect, useState} from 'react'
import { Typography, Grid, TextField, Box, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import {
  useDebounce,
  isStringEmpty,
  searchParticipants,
  isArrayNotEmpty,
  getParticipantsExportUrl,
  BaseAdminIdProps,
  ParticipantList,
  concatParticipantList,
  ParticipantListable
} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import {Link as RouterLink} from "react-router-dom";
import {PageTitle} from "../../../common/theme/typography/Tags";
import {useAdminNavigation} from "../../AdminNavigationHook";
import Button from "@mui/material/Button";
import {FormCheckboxSimple} from "../../../common/input/FormCheckboxSimple";
import {commonStyles} from "../../../common/theme/CommonStylesSx";

export type ParticipantSearchResult = {
  filteredParticipants: ParticipantListable[],
  hasSearchText: boolean;
};

export type ParticipantSearchChangeCallback = {
  onParticipantSearchChanged: (result: ParticipantSearchResult) => unknown;
};

export type ParticipantShowMiscNotesCallback = {
  onShowMiscNotesChange: (result: boolean) => unknown;
};

type ParticipantsListHeaderProps = {
  numberOfParticipants: React.ReactNode;
  participantList: ParticipantList
  showMiscNotes: boolean;
} & BaseAdminIdProps & ParticipantSearchChangeCallback & ParticipantShowMiscNotesCallback;

export function ParticipantsListHeader({adminId, numberOfParticipants, participantList, onParticipantSearchChanged, showMiscNotes, onShowMiscNotesChange}: ParticipantsListHeaderProps) {

  const [search, setSearch] = useState({ searchText: '', isSearching: false });
  const [searchableParticipants, setSearchableParticipants] = useState<ParticipantListable[]>([]);

  const debouncedSearchText = useDebounce(search.searchText, 400);

  const {t} = useTranslation(['admin', 'common']);
  const {generateParticipantMessagesPath} = useAdminNavigation();

  React.useEffect(() => {
    setSearchableParticipants(concatParticipantList(participantList));
  }, [participantList]);

  function handleSearchTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newSearchText = event.target.value;
    setSearch( { ...search, searchText: newSearchText });
  }

  useEffect(() => {
    let result = searchableParticipants;
    const hasSearchText = !isStringEmpty(debouncedSearchText);
    if (hasSearchText) {
      setSearch({ ...search, isSearching: true});
      result = searchParticipants(searchableParticipants, debouncedSearchText);
      setSearch({ ...search, isSearching: false});
    }
    onParticipantSearchChanged({ filteredParticipants: result, hasSearchText: hasSearchText}); // eslint-disable-next-line
  }, [debouncedSearchText, searchableParticipants]);

  return (
    <Box component={"div"} mb={2}>
      <PageTitle>{t('common:headline_participantlist')}</PageTitle>
      <Box mt={1}>
        <Grid container direction={"row"} spacing={2} alignItems={"center"} justifyContent={"flex-start"}>
          <Grid item xs={12} sm={7} lg={3}>
            <TextField
              variant="standard"
              onChange={handleSearchTextChange}
              id="searchInput"
              size={"small"}
              data-testid={"participant-list-search-input"}
              label="Suche nach Email, Name, Adresse"
              type="Search"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"> <SearchIcon /></InputAdornment>
              }} />
          </Grid>
          <Grid item xs={12} sm={5} lg={2}>
            <Typography variant={"subtitle1"}>{numberOfParticipants}</Typography>
          </Grid>
          <Grid item xs={12} sm={12} lg={2} sx={commonStyles.textAlignRight}>
            <Button color={"primary"} variant={"outlined"}
                    to={generateParticipantMessagesPath(adminId)}
                    component={RouterLink}>{t('messages_send_participants')}</Button>
          </Grid>


          { isArrayNotEmpty(searchableParticipants) &&
            <Grid item xs={12} lg={5} sx={commonStyles.textAlignRight}>
              <Button href={getParticipantsExportUrl(adminId)} rel='noopener noreferrer' color="primary" target="_blank">{t('admin:export')}</Button>
            </Grid> 
          }

        </Grid>

        <Grid container direction={"row"} spacing={2} alignItems={"center"} justifyContent={"flex-start"}>
          <Grid item xs={12} sm={7}>
            <FormCheckboxSimple name={"showMiscNotes"}
                                label={t("admin:participants_show_misc_notes")}
                                onClick={() => {onShowMiscNotesChange(!showMiscNotes)}}
                                checked={showMiscNotes} />
          </Grid>
        </Grid>

      </Box>
    </Box>
  );

}
