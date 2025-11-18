import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { Box, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import {
  fetchSelfAdminTeam,
  Fullname,
  getFullname,
  getSelfAdminTeamFetchSelector,
  getTeamPartnerOptionOfTeam,
  isSameEntity,
  Participant,
  SelfAdminChangeTeamHostViewModel,
  SelfAdminUpdateTeamHostRequest,
  Team,
  TeamPartnerOption,
  updateSelfAdminTeamHost,
  useBackendIssueHandler,
  useSelfAdminDispatch,
  useSelfAdminSelector,
} from '@runningdinner/shared';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import FormTextField from '../common/input/FormTextField';
import { useNotificationHttpError } from '../common/NotificationHttpErrorHook';
import { commonStyles } from '../common/theme/CommonStyles';
import { useCustomSnackbar } from '../common/theme/CustomSnackbarHook';
import { PrimaryButton } from '../common/theme/PrimaryButton';
import Paragraph from '../common/theme/typography/Paragraph';
import { PageTitle } from '../common/theme/typography/Tags';

const NewSelectedHostText = styled('strong')(({ theme }) => ({
  color: theme.palette.secondary.main,
}));

export default function SelfAdminChangeTeamHostPage() {
  const urlParams = useParams<Record<string, string>>();
  const selfAdminId = urlParams.selfAdminId || '';
  const participantId = urlParams.participantId || '';
  const teamId = urlParams.teamId || '';

  const dispatch = useSelfAdminDispatch();

  const { data: team } = useSelfAdminSelector(getSelfAdminTeamFetchSelector);

  React.useEffect(() => {
    dispatch(fetchSelfAdminTeam({ selfAdminId, participantId, teamId }));
  }, [dispatch, selfAdminId, participantId, teamId]);

  if (!team) {
    return null;
  }

  if (getTeamPartnerOptionOfTeam(team) === TeamPartnerOption.REGISTRATION) {
    return <SelfAdminChangeTeamHostNotPossibleView />;
  }

  return <SelfAdminChangeTeamHostView team={team} />;
}

interface SelfAdminChangeTeamHostViewProps {
  team: Team;
}

function SelfAdminChangeTeamHostView({ team }: SelfAdminChangeTeamHostViewProps) {
  const { t } = useTranslation(['selfadmin', 'common']);

  const urlParams = useParams<Record<string, string>>();
  const selfAdminId = urlParams.selfAdminId || '';
  const participantId = urlParams.participantId || '';
  const teamId = urlParams.teamId || '';

  const [newHostTeamMember, setNewHostTeamMember] = useState<Participant>(team.hostTeamMember);
  const [currentTeam, setCurrentTeam] = useState<Team>(team);

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('lg'));
  const { showSuccess } = useCustomSnackbar();

  const { getIssuesTranslated } = useBackendIssueHandler();
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const fullWidthProps = isSmallDevice ? commonStyles.fullWidth : {};

  const formMethods = useForm<SelfAdminChangeTeamHostViewModel>({
    defaultValues: { comment: '' },
    mode: 'onTouched',
  });
  const { handleSubmit, clearErrors, formState } = formMethods;
  const { isSubmitting } = formState;

  async function updateTeamHost(updatedValues: SelfAdminChangeTeamHostViewModel) {
    clearErrors();
    const requestBody: SelfAdminUpdateTeamHostRequest = {
      teamId,
      participantId,
      comment: updatedValues.comment,
      newHostingTeamMemberId: newHostTeamMember.id!,
    };
    try {
      const updatedTeam = await updateSelfAdminTeamHost({ selfAdminId, participantId, teamId }, requestBody);
      const successMessage = <Trans i18nKey={'selfadmin:change_team_host_success_text'} values={{ newTeamHost: getFullname(newHostTeamMember) }} />;
      showSuccess(successMessage, { wrapInHtmlContainer: true });
      setCurrentTeam(updatedTeam);
    } catch (e) {
      showHttpErrorDefaultNotification(e, { showGenericMesssageOnValidationError: true });
    }
  }

  function isTeamHost(teamMember: Participant) {
    return isSameEntity(teamMember, newHostTeamMember);
  }

  function handleTeamMemberChange(teamMember: Participant, isHost: boolean) {
    if (isHost) {
      setNewHostTeamMember(teamMember);
    }
  }

  function isTeamHostChanged() {
    return !isSameEntity(newHostTeamMember, currentTeam.hostTeamMember);
  }

  function isNewSelectedTeamHost(teamMember: Participant) {
    return isTeamHost(teamMember) && !isSameEntity(currentTeam.hostTeamMember, teamMember);
  }

  return (
    <FormProvider {...formMethods}>
      <form>
        <PageTitle>{t('selfadmin:change_team_host_title')}</PageTitle>
        <Paragraph>{t('selfadmin:change_team_host_help')}</Paragraph>
        <Box mt={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <List dense={isSmallDevice}>
                {team.teamMembers.map((teamMember) => (
                  <ListItem button divider onClick={() => handleTeamMemberChange(teamMember, !isTeamHost(teamMember))} key={teamMember.id}>
                    <ListItemIcon>
                      <Box p={isSmallDevice ? 2 : 3}>
                        <TeamMemberHostCheckboxIcon onChange={(newState) => handleTeamMemberChange(teamMember, newState)} checked={isTeamHost(teamMember)} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <>
                          <span>
                            <Fullname {...teamMember} />
                          </span>
                          {isNewSelectedTeamHost(teamMember) && <NewSelectedHostText>&nbsp;&nbsp;* </NewSelectedHostText>}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Box>
        <Box mt={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormTextField
                fullWidth
                variant="outlined"
                helperText={t('selfadmin:change_team_host_comment_help')}
                multiline
                disabled={!isTeamHostChanged()}
                rows={3}
                name="comment"
                label={t('selfadmin:change_team_host_comment')}
              />
            </Grid>
          </Grid>
        </Box>

        <Box my={3}>
          <Grid container justifyContent={'flex-end'} direction={'row'}>
            <Grid item xs={isSmallDevice ? 12 : undefined}>
              <PrimaryButton onClick={handleSubmit(updateTeamHost)} sx={fullWidthProps} disabled={isSubmitting || !isTeamHostChanged()} size={'large'}>
                {t('common:save')}
              </PrimaryButton>
            </Grid>
          </Grid>
        </Box>
      </form>
    </FormProvider>
  );
}

interface TeamMemberHostCheckboxProps {
  onChange: (checked: boolean) => unknown;
  checked: boolean;
}

function TeamMemberHostCheckboxIcon({ checked, onChange }: TeamMemberHostCheckboxProps) {
  return (
    <>
      {!checked && <CheckBoxOutlineBlankOutlinedIcon style={{ fontSize: 48 }} onClick={() => onChange(true)} />}
      {checked && <CheckBoxOutlinedIcon color={'primary'} style={{ fontSize: 48 }} onClick={() => onChange(false)} />}
    </>
  );
}

function SelfAdminChangeTeamHostNotPossibleView() {
  const { t } = useTranslation(['selfadmin']);

  return (
    <>
      <PageTitle>{t('selfadmin:change_team_host_title')}</PageTitle>
      <Paragraph>{t('selfadmin:change_team_host_help')}</Paragraph>
      <Box mt={3}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Alert severity={'info'} variant={'outlined'}>
              {t('selfadmin:team_partner_wish_registration_change_teamhost_not_possible')}
            </Alert>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
