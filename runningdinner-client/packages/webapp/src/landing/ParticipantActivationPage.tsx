import React from 'react';
import {PageTitle, Span} from "../common/theme/typography/Tags";
import {Trans, useTranslation} from "react-i18next";
import {useAsync} from "react-async-hook";
import {
  activateSubscribedParticipant, BackendIssue,
  CONSTANTS,
  findPublicRunningDinnerByPublicId,
  isStringEmpty, isStringNotEmpty,
  PublicRunningDinner, useBackendIssueHandler
} from "@runningdinner/shared";
import {useParams} from "react-router-dom";
import {Alert, AlertTitle} from "@material-ui/lab";
import LinkExtern from "../common/theme/LinkExtern";

export function ParticipantActivationPage() {

  const {t} = useTranslation("landing");

  const params = useParams<Record<string, string>>();
  const publicDinnerId = params.publicDinnerId || "";
  const participantId = params.participantId || "";

  const activationAsyncResult = useAsync(activateSubscribedParticipant, [publicDinnerId, participantId]);
  const publicDinnerAsyncResult = useAsync(findPublicRunningDinnerByPublicId, [publicDinnerId]);

  if (isStringEmpty(participantId) || isStringEmpty(publicDinnerId)) {
    return <ParticipantActivationFailedView publicRunningDinnerLoading={false} />
  }

  const  { loading: activationPending, result: activationResult } = activationAsyncResult;
  const { loading: publicRunningDinnerLoading, result: publicRunningDinnerResult } = publicDinnerAsyncResult;

  return (
    <div>
      <PageTitle>{t("landing:registration_activation_title")}</PageTitle>

      { !activationPending &&
        activationResult?.activationSucceeded &&
        <ParticipantActivationSucceededView publicRunningDinnerLoading={publicRunningDinnerLoading}
                                            publicRunningDinnerResult={publicRunningDinnerResult} />
      }

      { !activationPending &&
        activationResult?.activationSucceeded === false &&
        <ParticipantActivationFailedView publicRunningDinnerLoading={publicRunningDinnerLoading}
                                         publicRunningDinnerResult={publicRunningDinnerResult}
                                         validationIssue={activationResult.validationIssue} />
      }

    </div>
  );
}

interface PublicDinnerLoadingProps {
  publicRunningDinnerLoading: boolean;
  publicRunningDinnerResult?: PublicRunningDinner;
}

export function ParticipantActivationSucceededView({publicRunningDinnerResult}: PublicDinnerLoadingProps) {

  const {t} = useTranslation("landing");

  if (!publicRunningDinnerResult) {
    return null;
  }
  const {publicSettings} = publicRunningDinnerResult;

  return (
    <div>
      <Alert severity={"success"} variant={"outlined"}>
        <AlertTitle>{t('landing:registration_activation_congratulation_title')}</AlertTitle>
        <Span>
          <Trans i18nKey={"landing:registration_activation_congratulation_text"}
                 components={{
                   // @ts-ignore
                   anchor: <LinkExtern />
                 }}
                 values={{
                   adminEmail: publicSettings.publicContactEmail,
                   publicDinnerTitle: publicSettings.title,
                   publicDinnerUrl: publicSettings.publicDinnerUrl
                 }} />
        </Span>
      </Alert>
    </div>
  );
}

interface ParticipantActivationFailedViewProps extends PublicDinnerLoadingProps {
  validationIssue?: BackendIssue;
}

export function ParticipantActivationFailedView({publicRunningDinnerResult, publicRunningDinnerLoading, validationIssue}: ParticipantActivationFailedViewProps) {

  const {t} = useTranslation("landing");

  const {getIssuesArrayTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ["landing", "common", "admin"]
    }
  });

  if (publicRunningDinnerLoading) {
    return null;
  }

  const activationErrorEmail = isStringNotEmpty(publicRunningDinnerResult?.publicSettings.publicContactEmail) ?
                                                publicRunningDinnerResult!.publicSettings.publicContactEmail :
                                                CONSTANTS.GLOBAL_ADMIN_EMAIL;

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
      <Alert severity={"error"} variant={"outlined"}>
        <AlertTitle>{t('landing:registration_activation_error_title')}</AlertTitle>
        { isStringEmpty(validationIssueMessage) &&
            <Span>
              <Trans i18nKey={"landing:registration_activation_error_text"}
                     // @ts-ignore
                     components={{ anchor: <LinkExtern /> }}
                     values={{ adminEmail: activationErrorEmail }} />
            </Span>
        }
        { isStringNotEmpty(validationIssueMessage) && <Span>{validationIssueMessage}</Span> }
      </Alert>
    </div>
  );
}