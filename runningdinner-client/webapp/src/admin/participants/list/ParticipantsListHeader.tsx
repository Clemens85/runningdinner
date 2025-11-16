import SearchIcon from '@mui/icons-material/Search';
import { Box, Grid, InputAdornment,TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import {
  BaseAdminIdProps,
  concatParticipantList,
  getParticipantsExportUrl,
  isArrayNotEmpty,
  isStringEmpty,
  ParticipantList,
  ParticipantListable,
  searchParticipants,
  useDebounce,
  useFindParticipants,
  useNumberOfParticipants,
} from '@runningdinner/shared';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import HtmlTranslate from '../../../common/i18n/HtmlTranslate';
import { FormCheckboxSimple } from '../../../common/input/FormCheckboxSimple';
import { commonStyles } from '../../../common/theme/CommonStyles';
import { PageTitle } from '../../../common/theme/typography/Tags';

export type ParticipantSearchResult = {
  filteredParticipants: ParticipantListable[];
  hasSearchText: boolean;
};

export type ParticipantSearchChangeCallback = {
  onParticipantSearchChanged: (result: ParticipantSearchResult) => unknown;
};

export type ParticipantShowMiscNotesCallback = {
  onShowMiscNotesChange: (result: boolean) => unknown;
};

type ParticipantsListHeaderProps = {
  showMiscNotes: boolean;
} & BaseAdminIdProps &
  ParticipantSearchChangeCallback &
  ParticipantShowMiscNotesCallback;

export function ParticipantsListHeader({ adminId, onParticipantSearchChanged, showMiscNotes, onShowMiscNotesChange }: ParticipantsListHeaderProps) {
  const { data: participantList } = useFindParticipants(adminId);

  const [search, setSearch] = useState({ searchText: '', isSearching: false });
  const [searchableParticipants, setSearchableParticipants] = useState<ParticipantListable[]>([]);

  const debouncedSearchText = useDebounce(search.searchText, 400);

  const { t } = useTranslation(['admin', 'common']);

  React.useEffect(() => {
    setSearchableParticipants(concatParticipantList(participantList));
  }, [participantList]);

  function handleSearchTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newSearchText = event.target.value;
    setSearch({ ...search, searchText: newSearchText });
  }

  useEffect(() => {
    let result = searchableParticipants;
    const hasSearchText = !isStringEmpty(debouncedSearchText);
    if (hasSearchText) {
      setSearch({ ...search, isSearching: true });
      result = searchParticipants(searchableParticipants, debouncedSearchText);
      setSearch({ ...search, isSearching: false });
    }
    onParticipantSearchChanged({ filteredParticipants: result, hasSearchText: hasSearchText }); // eslint-disable-next-line
  }, [debouncedSearchText, searchableParticipants]);

  return (
    <Box component={'div'} mb={2}>
      <PageTitle>{t('common:headline_participantlist')}</PageTitle>
      <Box mt={1}>
        <Grid container direction={'row'} spacing={2} alignItems={'center'} justifyContent={'flex-start'}>
          <Grid item xs={12} sm={7} lg={3}>
            <TextField
              variant="standard"
              onChange={handleSearchTextChange}
              id="searchInput"
              size={'small'}
              data-testid={'participant-list-search-input'}
              label="Suche nach E-Mail, Name, Adresse"
              type="Search"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {' '}
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5} lg={2}>
            <Typography variant={'subtitle1'}>
              <NumberOfParticipants participantList={participantList!} />
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} lg={2} sx={commonStyles.textAlignRight}>
            {/* <Button color={"primary"} variant={"outlined"}
                    to={generateParticipantMessagesPath(adminId)}
                    component={RouterLink}>{t('messages_send_participants')}</Button> */}
          </Grid>

          {isArrayNotEmpty(searchableParticipants) && (
            <Grid item xs={12} lg={5} sx={commonStyles.textAlignRight}>
              <Button href={getParticipantsExportUrl(adminId)} rel="noopener noreferrer" color="primary" target="_blank">
                {t('admin:export')}
              </Button>
            </Grid>
          )}
        </Grid>

        <Grid container direction={'row'} spacing={2} alignItems={'center'} justifyContent={'flex-start'}>
          <Grid item xs={12} sm={7}>
            <FormCheckboxSimple
              name={'showMiscNotes'}
              label={t('admin:participants_show_misc_notes')}
              onClick={() => {
                onShowMiscNotesChange(!showMiscNotes);
              }}
              checked={showMiscNotes}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

type NumberOfParticipantsProps = {
  participantList: ParticipantList;
};

function NumberOfParticipants({ participantList }: NumberOfParticipantsProps) {
  const { t } = useTranslation('admin');

  const { numberOfParticipantsTotal, numberOfParticipantsWaitingList } = useNumberOfParticipants(participantList);

  const result = <HtmlTranslate i18n="participants_number" ns="admin" parameters={{ numberParticipants: numberOfParticipantsTotal }} />;

  let numberOfParticipantsWaitingListInfo = '';
  if (numberOfParticipantsWaitingList > 0) {
    numberOfParticipantsWaitingListInfo = ' ' + t('participants_number_waiting_list', { numRemainingNotAssignableParticipants: numberOfParticipantsWaitingList });
  }

  return (
    <>
      {result} {numberOfParticipantsWaitingListInfo}
    </>
  );
}
