import SearchIcon from '@mui/icons-material/Search';
import { Box, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import {
  BaseAdminIdProps,
  concatParticipantList,
  isArrayNotEmpty,
  isStringEmpty,
  ParticipantList,
  ParticipantListable,
  searchParticipants,
  useDebounce,
  useFindParticipants,
  useNumberOfParticipants,
} from '@runningdinner/shared';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import HtmlTranslate from '../../../common/i18n/HtmlTranslate';
import { FormCheckboxSimple } from '../../../common/input/FormCheckboxSimple';
import { commonStyles } from '../../../common/theme/CommonStyles';
import { PageTitle } from '../../../common/theme/typography/Tags';
import { ExcelActionsButton } from './ExcelActionsButton';

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
  onImportClick: () => void;
} & BaseAdminIdProps &
  ParticipantSearchChangeCallback &
  ParticipantShowMiscNotesCallback;

export function ParticipantsListHeader({ adminId, onParticipantSearchChanged, showMiscNotes, onShowMiscNotesChange, onImportClick }: ParticipantsListHeaderProps) {
  const { data: participantList } = useFindParticipants(adminId);

  const [searchText, setSearchText] = useState('');

  const searchableParticipants = useMemo(() => concatParticipantList(participantList), [participantList]);

  const debouncedSearchText = useDebounce(searchText, 400);

  const { t } = useTranslation(['admin', 'common']);

  function handleSearchTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value);
  }

  useEffect(() => {
    const hasSearchText = !isStringEmpty(debouncedSearchText);
    const result = hasSearchText ? searchParticipants(searchableParticipants, debouncedSearchText) : searchableParticipants;
    onParticipantSearchChanged({ filteredParticipants: result, hasSearchText }); // eslint-disable-next-line
  }, [debouncedSearchText, searchableParticipants]);

  return (
    <Box
      component={'div'}
      sx={{
        mb: 2,
      }}
    >
      <PageTitle>{t('common:headline_participantlist')}</PageTitle>
      <Box
        sx={{
          mt: 1,
        }}
      >
        <Grid
          container
          direction={'row'}
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 7,
              lg: 3,
            }}
          >
            <TextField
              variant="standard"
              onChange={handleSearchTextChange}
              id="searchInput"
              size={'small'}
              data-testid={'participant-list-search-input'}
              label="Suche nach E-Mail, Name, Adresse"
              type="Search"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {' '}
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 5,
              lg: 2,
            }}
          >
            <Typography variant={'subtitle1'}>
              <NumberOfParticipants participantList={participantList!} />
            </Typography>
          </Grid>
          <Grid
            sx={commonStyles.textAlignRight}
            size={{
              xs: 12,
              sm: 12,
              lg: 2,
            }}
          >
            {/* <Button color={"primary"} variant={"outlined"}
                    to={generateParticipantMessagesPath(adminId)}
                    component={RouterLink}>{t('messages_send_participants')}</Button> */}
          </Grid>

          <Grid
            sx={commonStyles.textAlignRight}
            size={{
              xs: 12,
              lg: 5,
            }}
          >
            <ExcelActionsButton adminId={adminId} onImportClick={onImportClick} showExport={isArrayNotEmpty(searchableParticipants)} />
          </Grid>
        </Grid>

        <Grid
          container
          direction={'row'}
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 7,
            }}
          >
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
