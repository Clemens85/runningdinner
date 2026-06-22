import { Alert, AlertTitle, Box, Button } from '@mui/material';
import {
  activateSubscribedParticipant,
  BackendIssue,
  CONSTANTS,
  getFullname,
  isParticipantActivationSuccessful,
  isStringEmpty,
  isStringNotEmpty,
  ParticipantActivationResult,
  PublicRunningDinner,
  storePortalToken,
  useBackendIssueHandler,
  useFindPublicDinner,
} from '@runningdinner/shared';
import { useQuery } from '@tanstack/react-query';
import { Trans, useTranslation } from 'react-i18next';
import { useParams, useSearchParams, Link } from 'react-router-dom';

import LinkExtern from '../common/theme/LinkExtern';
import { PageTitle, Span } from '../common/theme/typography/Tags';
import { MY_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';

export function ParticipantActivationPage() {
  const { t } = useTranslation('landing');

  const params = useParams<Record<string, string>>();
  const [searchParams] = useSearchParams();
  const publicDinnerId = params.publicDinnerId || '';
  const participantId = params.participantId || '';
  const email = searchParams.get('email') ?? undefined;

  const activationQuery = useQuery({
    queryKey: ['activateSubscribedParticipant', publicDinnerId, participantId, email],
    queryFn: async () => {
      const result = await activateSubscribedParticipant(publicDinnerId, participantId, email);
      if (result.portalToken) {
        storePortalToken(result.portalToken);
      }
      return result;
    },
  });
  const findPublicDinnerQuery = useFindPublicDinner(publicDinnerId);

  if (isStringEmpty(participantId) || isStringEmpty(publicDinnerId)) {
    return <ParticipantActivationFailedView publicRunningDinnerLoading={false} />;
  }

  const hasPortalToken = isStringNotEmpty(activationQuery.data?.portalToken);

  return (
    <div>
      <PageTitle>{t('landing:registration_activation_title')}</PageTitle>

      {!activationQuery.isPending && isParticipantActivationSuccessful(activationQuery.data) && (
        <ParticipantActivationSucceededView activationResult={activationQuery.data!} publicRunningDinnerResult={findPublicDinnerQuery.data} hasPortalToken={hasPortalToken} />
      )}

      {!activationQuery.isPending && !isParticipantActivationSuccessful(activationQuery.data) && (
        <ParticipantActivationFailedView
          publicRunningDinnerLoading={findPublicDinnerQuery.isPending}
          publicRunningDinnerResult={findPublicDinnerQuery.data}
          validationIssue={activationQuery.data?.validationIssue}
        />
      )}
    </div>
  );
}

interface PublicDinnerLoadingProps {
  publicRunningDinnerResult?: PublicRunningDinner;
  activationResult: ParticipantActivationResult;
  hasPortalToken: boolean;
}

export function ParticipantActivationSucceededView({ publicRunningDinnerResult, activationResult, hasPortalToken }: PublicDinnerLoadingProps) {
  const { t } = useTranslation('landing');

  if (!publicRunningDinnerResult) {
    return null;
  }
  const { publicSettings } = publicRunningDinnerResult;

  return (
    <div>
      <Alert severity={'success'} variant={'outlined'}>
        <AlertTitle>{t('landing:registration_activation_congratulation_title')}</AlertTitle>
        <Span>
          {isStringNotEmpty(activationResult.activatedTeamPartnerRegistration?.lastname) ? (
            <Trans
              i18nKey={'landing:registration_activation_with_teampartner_congratulation_text'}
              components={{
                // @ts-expect-error -- type suppression
                anchor: <LinkExtern />,
              }}
              values={{
                adminEmail: publicSettings.publicContactEmail,
                publicDinnerTitle: publicSettings.title,
                publicDinnerUrl: publicSettings.publicDinnerUrl,
                fullname: getFullname(activationResult.activatedTeamPartnerRegistration!),
              }}
            />
          ) : (
            <Trans
              i18nKey={'landing:registration_activation_congratulation_text'}
              components={{
                // @ts-expect-error -- type suppression
                anchor: <LinkExtern />,
              }}
              values={{
                adminEmail: publicSettings.publicContactEmail,
                publicDinnerTitle: publicSettings.title,
                publicDinnerUrl: publicSettings.publicDinnerUrl,
              }}
            />
          )}
        </Span>
      </Alert>

      {hasPortalToken && (
        <Alert severity={'info'} variant={'outlined'} sx={{ mt: 2 }}>
          <AlertTitle>{t('landing:registration_activation_portal_title')}</AlertTitle>
          <Span>{t('landing:registration_activation_portal_hint')}</Span>
          <Box sx={{ mt: 1 }}>
            <Button component={Link} to={MY_EVENTS_PATH} variant="outlined" size="small">
              {t('landing:registration_activation_portal_link')}
            </Button>
          </Box>
        </Alert>
      )}
    </div>
  );
}

interface ParticipantActivationFailedViewProps {
  validationIssue?: BackendIssue;
  publicRunningDinnerLoading: boolean;
  publicRunningDinnerResult?: PublicRunningDinner;
}

export function ParticipantActivationFailedView({ publicRunningDinnerResult, publicRunningDinnerLoading, validationIssue }: ParticipantActivationFailedViewProps) {
  const { t } = useTranslation('landing');

  const { getIssuesArrayTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['landing', 'common', 'admin'],
    },
  });

  if (publicRunningDinnerLoading) {
    return null;
  }

  const activationErrorEmail = isStringNotEmpty(publicRunningDinnerResult?.publicSettings.publicContactEmail)
    ? publicRunningDinnerResult!.publicSettings.publicContactEmail
    : CONSTANTS.GLOBAL_ADMIN_EMAIL;

  function getValidationIssueMessage(): string | undefined {
    if (!validationIssue) {
      return undefined;
    }
    const translatedIssuesWrapper = getIssuesArrayTranslated([validationIssue]);
    const translatedIssue = translatedIssuesWrapper.issuesWithoutField.length > 0 ? translatedIssuesWrapper.issuesWithoutField[0] : undefined;
    return translatedIssue?.error?.message;
  }

  const validationIssueMessage = getValidationIssueMessage();

  return (
    <div>
      <Alert severity={'error'} variant={'outlined'}>
        <AlertTitle>{t('landing:registration_activation_error_title')}</AlertTitle>
        {isStringEmpty(validationIssueMessage) && (
          <Span>
            <Trans
              i18nKey={'landing:registration_activation_error_text'}
              // @ts-expect-error -- type suppression
              components={{ anchor: <LinkExtern /> }}
              values={{ adminEmail: activationErrorEmail }}
            />
          </Span>
        )}
        {isStringNotEmpty(validationIssueMessage) && <Span>{validationIssueMessage}</Span>}
      </Alert>
    </div>
  );
}
