import React, {useEffect, useState} from 'react'
import { Typography, Grid, TextField, Box, InputAdornment, Link } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import {useDebounce, isStringEmpty, searchParticipants} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import {Link as RouterLink} from "react-router-dom";
import {PageTitle} from "../../../common/theme/typography/Tags";
import {generateParticipantMessagesPath} from "../../../common/NavigationService";

export default function ParticipantsListHeader({adminId, numberOfParticipants, searchableParticipants, onParticipantSearchChanged}) {

  const [search, setSearch] = useState({ searchText: '', isSearching: false });
  const debouncedSearchText = useDebounce(search.searchText, 400);

  const {t} = useTranslation(['admin', 'common']);

  function handleSearchTextChange(event) {
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
    onParticipantSearchChanged({ filteredParticiants: result, hasSearchText: hasSearchText}); // eslint-disable-next-line
  }, [debouncedSearchText, searchableParticipants]);

  return (
      <Box component={"div"}>
        <PageTitle>
          {t('common:headline_participantlist')}
        </PageTitle>
        <Box mt={1}>
          <Grid container direction={"row"} spacing={2} alignItems={"center"} justify={"flex-start"}>
            <Grid item xs={12} sm={7} lg={3}>
              <TextField onChange={handleSearchTextChange} id="searchInput" size={"small"}
                         label="Suche nach Email, Name, Adresse" type="Search" fullWidth
                         InputProps={{
                           startAdornment: <InputAdornment position="start"> <SearchIcon /></InputAdornment>
                         }}/>
            </Grid>
            <Grid item xs={12} sm={5} lg={2}>
              <Typography variant={"subtitle1"}>{numberOfParticipants}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} lg={2}>
              <Link to={generateParticipantMessagesPath(adminId)} component={RouterLink} color="primary">{t('messages_send_participants')}</Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
  );

}
