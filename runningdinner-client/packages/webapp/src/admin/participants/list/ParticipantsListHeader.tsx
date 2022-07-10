import React, {useEffect, useState} from 'react'
import { Typography, Grid, TextField, Box, InputAdornment } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
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
import Button from "@material-ui/core/Button";
import useCommonStyles from "../../../common/theme/CommonStyles";

export type ParticipantSearchResult = {
  filteredParticipants: ParticipantListable[],
  hasSearchText: boolean;
};

export type ParticipantSearchChangeCallback = {
  onParticipantSearchChanged: (result: ParticipantSearchResult) => unknown;
};

type ParticipantsListHeaderProps = {
  numberOfParticipants: React.ReactNode;
  participantList: ParticipantList
} & BaseAdminIdProps & ParticipantSearchChangeCallback;

export function ParticipantsListHeader({adminId, numberOfParticipants, participantList, onParticipantSearchChanged}: ParticipantsListHeaderProps) {

  const [search, setSearch] = useState({ searchText: '', isSearching: false });
  const [searchableParticipants, setSearchableParticipants] = useState<ParticipantListable[]>([]);

  const debouncedSearchText = useDebounce(search.searchText, 400);

  const {t} = useTranslation(['admin', 'common']);
  const classes = useCommonStyles();
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
          <Grid container direction={"row"} spacing={2} alignItems={"center"} justify={"flex-start"}>
            <Grid item xs={12} sm={7} lg={3}>
              <TextField onChange={handleSearchTextChange} id="searchInput" size={"small"}
                         data-testid={"participant-list-search-input"}
                         label="Suche nach Email, Name, Adresse" type="Search" fullWidth
                         InputProps={{
                           startAdornment: <InputAdornment position="start"> <SearchIcon /></InputAdornment>
                         }}/>
            </Grid>
            <Grid item xs={12} sm={5} lg={2}>
              <Typography variant={"subtitle1"}>{numberOfParticipants}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} lg={2} className={classes.textAlignRight}>
              <Button color={"primary"} variant={"outlined"}
                      to={generateParticipantMessagesPath(adminId)}
                      component={RouterLink}>{t('messages_send_participants')}</Button>
            </Grid>


            { isArrayNotEmpty(searchableParticipants) &&
              <Grid item xs={12} lg={5} className={classes.textAlignRight}>
                <Button href={getParticipantsExportUrl(adminId)} rel='noopener noreferrer' color="primary" target="_blank">{t('admin:export')}</Button>
              </Grid> 
            }

          </Grid>
        </Box>
      </Box>
  );

}
