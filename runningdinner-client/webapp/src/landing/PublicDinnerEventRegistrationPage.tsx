import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Grid, List, ListItem, ListItemIcon, ListItemText, styled, Typography } from '@mui/material';
import { Alert } from '@mui/material';
import {
  AddressLocation,
  AfterPartyLocationHeadline,
  assertDefined,
  BasePublicDinnerProps,
  calculateResultingZipRestrictions,
  formatLocalDate,
  isAfterPartyLocationDefined,
  isArrayEmpty,
  isQuerySucceeded,
  isStringEmpty,
  isStringNotEmpty,
  LocalDate,
  Meal,
  PublicRunningDinner,
  RegistrationData,
  Time,
  useDisclosure,
  useFindPublicDinner,
} from '@runningdinner/shared';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { FetchProgressBar } from '../common/FetchProgressBar';
import { BackToListButton } from '../common/hooks/MasterDetailViewHook';
import { getLocalStorageItem, setPublicEventRegistrationInLocalStorage } from '../common/LocalStorageService';
import { TextViewHtml } from '../common/TextViewHtml';
import FormFieldset from '../common/theme/FormFieldset';
import LinkExtern from '../common/theme/LinkExtern';
import { PrimaryButton } from '../common/theme/PrimaryButton';
import Paragraph from '../common/theme/typography/Paragraph';
import { PageTitle } from '../common/theme/typography/Tags';
import { useLandingNavigation } from './LandingNavigationHook';
import { PublicContactInfo } from './PublicContactInfo';
import { PublicDemoDinnerEventNotification } from './PublicDemoDinnerEventNotification';
import { PublicDinnerEventRegistrationFormContainer } from './PublicDinnerEventRegistrationForm';

type RegistrationFormSettingsType = {
  showRegistrationForm?: boolean;
};

export function PublicDinnerEventRegistrationPage({ showRegistrationForm }: RegistrationFormSettingsType) {
  const params = useParams<Record<string, string>>();
  const publicDinnerId = params.publicDinnerId;

  const findPublicDinnerQuery = useFindPublicDinner(publicDinnerId || '');
  if (!isQuerySucceeded(findPublicDinnerQuery)) {
    return <FetchProgressBar {...findPublicDinnerQuery} />;
  }
  assertDefined(findPublicDinnerQuery.data);
  return <PublicDinnerEventDetailsView publicRunningDinner={findPublicDinnerQuery.data} showRegistrationForm={showRegistrationForm} />;
}

const MealListItemIcon = styled(ListItemIcon)({
  minWidth: '36px',
});

export function PublicDinnerEventDetailsView({ publicRunningDinner, showRegistrationForm }: BasePublicDinnerProps & RegistrationFormSettingsType) {
  const { t, i18n } = useTranslation(['landing', 'common']);

  const { navigateToRegistrationFinished, navigateToRunningDinnerEventList } = useLandingNavigation();

  const { isOpen: isRegistrationFormOpen, open: openRegistrationForm, close: closeRegistrationForm } = useDisclosure(showRegistrationForm);

  const { publicSettings } = publicRunningDinner;
  const isPublicContactInfoAvailable =
    isStringNotEmpty(publicSettings.publicContactName) || isStringNotEmpty(publicSettings.publicContactEmail) || isStringNotEmpty(publicSettings.publicContactMobileNumber);

  const registrationButtonHidden = publicRunningDinner.registrationDateExpired || publicSettings.registrationDeactivated || isCurrentUserSubscribedToEvent();

  const endOfRegistrationDateStr = formatLocalDate(publicSettings.endOfRegistrationDate);

  const { afterPartyLocation } = publicRunningDinner;
  const hasAfterPartyLocation = isAfterPartyLocationDefined(afterPartyLocation);

  React.useEffect(() => {
    i18n.changeLanguage(publicRunningDinner.languageCode);
  }, [i18n, publicRunningDinner.languageCode]);

  function renderMealListItem(meal: Meal) {
    return (
      <ListItem key={meal.id} disableGutters>
        <MealListItemIcon>
          <ScheduleIcon color={'primary'} />
        </MealListItemIcon>
        <ListItemText
          primary={
            <>
              <Time date={meal.time} />: &nbsp;
              {meal.label}
            </>
          }
        />
      </ListItem>
    );
  }

  function handleRegistrationPerformed(registrationData: RegistrationData) {
    setPublicEventRegistrationInLocalStorage(publicSettings.publicDinnerId, registrationData);
    navigateToRegistrationFinished(publicSettings.publicDinnerId);
  }

  function isCurrentUserSubscribedToEvent(): boolean {
    const existingRegistrationData = getCurrentUserSubscribedToEvent();
    return !!existingRegistrationData;
  }

  function getCurrentUserSubscribedToEvent(): RegistrationData | undefined {
    return getLocalStorageItem<RegistrationData>(`registration_${publicSettings.publicDinnerId}`);
  }

  function renderRegistrationNotPossibleText() {
    const textKey = publicRunningDinner.registrationDateExpired
      ? 'landing:registration_date_expired'
      : publicRunningDinner.publicSettings.registrationDeactivated
        ? 'common:registration_deactivated_text'
        : '';
    if (isStringEmpty(textKey)) {
      return null;
    }
    return (
      <div>
        <Typography component="em" variant={'body1'}>
          {t(textKey)}
        </Typography>
      </div>
    );
  }

  return (
    <>
      <PublicDemoDinnerEventNotification publicRunningDinner={publicRunningDinner} />
      <BackToListButton onBackToList={navigateToRunningDinnerEventList} mb={-2} mt={2} />
      <PageTitle>{publicSettings.title}</PageTitle>
      <Box>
        <div style={{ display: 'flex', marginTop: '-15px' }}>
          <LocationOnIcon color={'primary'} />
          <Paragraph>
            <AddressLocation cityName={publicRunningDinner.city} zip={publicRunningDinner.zip} />
          </Paragraph>
        </div>
        <div style={{ display: 'flex', marginTop: '15px' }}>
          <CalendarTodayIcon color={'primary'} />
          <Paragraph>
            <LocalDate date={publicRunningDinner.date} />
          </Paragraph>
        </div>
      </Box>

      <Box mt={2}>
        <FormFieldset>{t('common:schedule')}</FormFieldset>
        <List dense={true} disablePadding>
          {publicRunningDinner.meals.map((meal) => renderMealListItem(meal))}
        </List>
      </Box>

      <Box mt={2}>
        <FormFieldset>{t('common:description')}</FormFieldset>
        <Paragraph>
          <TextViewHtml text={publicSettings.description} />
        </Paragraph>
      </Box>

      {hasAfterPartyLocation && (
        <Box mt={2}>
          <FormFieldset>
            <AfterPartyLocationHeadline {...afterPartyLocation!} />
          </FormFieldset>
          {isStringNotEmpty(afterPartyLocation!.addressName) && <Paragraph>{afterPartyLocation!.addressName}</Paragraph>}
          <Paragraph>
            {afterPartyLocation!.street} {afterPartyLocation!.streetNr}
          </Paragraph>
          <Paragraph>
            {afterPartyLocation!.zip} {afterPartyLocation!.cityName}
          </Paragraph>
          {isStringNotEmpty(afterPartyLocation!.addressRemarks) && <Paragraph>{afterPartyLocation!.addressRemarks}</Paragraph>}
        </Box>
      )}

      {isPublicContactInfoAvailable && (
        <Box mt={2}>
          <PublicContactInfo {...publicSettings} />
        </Box>
      )}

      <Box mt={2}>
        <FormFieldset>{t('common:registration')}</FormFieldset>
        <Paragraph i18n={'landing:dinner_event_deadline_text'} parameters={{ endOfRegistrationDate: endOfRegistrationDateStr }} />
        <ZipRestrictionsInfo {...publicRunningDinner} />
        <PaymentInfo {...publicRunningDinner} />
      </Box>

      <Box my={2}>
        {renderRegistrationNotPossibleText()}
        {!registrationButtonHidden && (
          <PrimaryButton size={'large'} onClick={openRegistrationForm} data-testid="registration-form-open-action">
            {t('landing:goto_registration')}
          </PrimaryButton>
        )}
        {registrationButtonHidden && isCurrentUserSubscribedToEvent() && (
          <Grid container>
            <Grid item>
              <Alert severity={'success'} variant={'outlined'}>
                <Box mb={1}>
                  <Trans i18nKey={'landing:currentuser_already_registered_info'} components={{ italic: <em /> }} values={{ email: getCurrentUserSubscribedToEvent()?.email }} />
                </Box>
                <Box mb={1}>
                  <Trans
                    i18nKey={'landing:currentuser_already_registered_cancel'}
                    // @ts-ignore
                    components={{ anchor: <LinkExtern /> }}
                    values={{ email: publicSettings.publicContactEmail }}
                  />
                </Box>
                <Box>
                  {t('landing:currentuser_already_registered_new_register')} &nbsp;{' '}
                  <PrimaryButton onClick={openRegistrationForm} size={'small'}>
                    {t('landing:goto_registration')}
                  </PrimaryButton>
                </Box>
              </Alert>
            </Grid>
          </Grid>
        )}
      </Box>

      {isRegistrationFormOpen && (
        <PublicDinnerEventRegistrationFormContainer
          publicRunningDinner={publicRunningDinner}
          onRegistrationPerformed={handleRegistrationPerformed}
          onCancel={closeRegistrationForm}
        />
      )}
    </>
  );
}

function PaymentInfo(publicRunningDinner: PublicRunningDinner) {
  const { t } = useTranslation(['landing']);

  if (publicRunningDinner.paymentOptions && publicRunningDinner.paymentOptions.pricePerRegistration > 0) {
    const priceInfo = t('landing:registration_payment_price_single', { pricePerRegistration: publicRunningDinner.paymentOptions.pricePerRegistrationFormatted });
    return <Paragraph>{priceInfo}</Paragraph>;
  }
  return null;
}

function ZipRestrictionsInfo({ zipRestrictions }: PublicRunningDinner) {
  const { t } = useTranslation(['common']);

  const zipRestrictionsCalcResult = calculateResultingZipRestrictions(zipRestrictions);
  if (isArrayEmpty(zipRestrictionsCalcResult.zipRestrictions)) {
    return null;
  }

  const zipRestrictionsText = zipRestrictionsCalcResult.zipRestrictions.map((zipRestriction) => ` ${zipRestriction}`).join(',');

  return (
    <>
      <Paragraph>
        {t('common:zip_restrictions_enabled')}
        {zipRestrictionsText}
      </Paragraph>
    </>
  );
}
