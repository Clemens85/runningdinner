import React from 'react';
import {useTranslation} from "react-i18next";
import {Fetch} from "../common/Fetch";
import {
  AddressLocation, BasePublicDinnerProps,
  findPublicRunningDinnerByPublicId,
  formatLocalDate,
  isStringEmpty,
  isStringNotEmpty,
  LocalDate,
  Meal,
  RegistrationData,
  Time,
  useDisclosure
} from "@runningdinner/shared";
import {PageTitle} from "../common/theme/typography/Tags";
import {useParams} from "react-router-dom";
import {
  Box,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography
} from '@material-ui/core';
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import Paragraph from "../common/theme/typography/Paragraph";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import FormFieldset from "../common/theme/FormFieldset";
import ScheduleIcon from '@material-ui/icons/Schedule';
import {PrimaryButton} from "../common/theme/PrimaryButton";
import {BackToListButton} from "../common/hooks/MasterDetailViewHook";
import { PublicDinnerEventRegistrationForm } from './PublicDinnerEventRegistrationForm';
import {useLandingNavigation} from "./LandingNavigationHook";
import {getLocalStorageItem, setLocalStorageItem} from "../common/LocalStorageService";

export function PublicDinnerEventRegistrationPage() {

  const params = useParams<Record<string, string>>();
  const publicDinnerId = params.publicDinnerId;

  return <Fetch asyncFunction={findPublicRunningDinnerByPublicId}
                parameters={[publicDinnerId]}
                render={publicRunningDinner =>
                  <div>
                    <PublicDinnerEventDetailsView publicRunningDinner={publicRunningDinner.result} />
                  </div>
                } />;
}

const useMealListStyles = makeStyles(() => ({
  root: {
    minWidth: "36px"
  }
}));

export function PublicDinnerEventDetailsView({publicRunningDinner}: BasePublicDinnerProps) {

  const {t} = useTranslation(["landing", "common"]);

  const {navigateToRegistrationFinished, navigateToRunningDinnerEventList} = useLandingNavigation();

  const mealListClasses = useMealListStyles();

  const { isOpen: isRegistrationFormOpen, open: openRegistrationForm, close: closeRegistrationForm } = useDisclosure();

  const {publicSettings} = publicRunningDinner;
  const isPublicContactInfoAvailable = isStringNotEmpty(publicSettings.publicContactName) ||
                                       isStringNotEmpty(publicSettings.publicContactEmail) ||
                                       isStringNotEmpty(publicSettings.publicContactMobileNumber);

  const registrationButtonHidden = publicRunningDinner.registrationDateExpired ||
                                   publicSettings.registrationDeactivated ||
                                   isCurrentUserSubscribedToEvent();

  const endOfRegistrationDateStr = formatLocalDate(publicSettings.endOfRegistrationDate);

  function renderMealListItem(meal: Meal) {
    return (
      <ListItem key={meal.id} disableGutters>
        <ListItemIcon classes={{ root:  mealListClasses.root }}>
          <ScheduleIcon color={"primary"} />
        </ListItemIcon>
        <ListItemText primary={
          <>
            <Time date={meal.time} />: &nbsp;
            { meal.label }
          </>
        } />
      </ListItem>
    );
  }

  function handleRegistrationPerformed(registrationData: RegistrationData) {
    setLocalStorageItem(`registration_${publicSettings.publicDinnerId}`, registrationData);
    navigateToRegistrationFinished(publicSettings.publicDinnerId);
  }

  function isCurrentUserSubscribedToEvent(): boolean {
    const existingRegistrationData = getLocalStorageItem<RegistrationData>(`registration_${publicSettings.publicDinnerId}`);
    return !!existingRegistrationData;
  }

  function renderRegistrationNotPossibleText() {
    const textKey = publicRunningDinner.registrationDateExpired ?
                      "landing:registration_date_expired" :
                     (publicRunningDinner.publicSettings.registrationDeactivated ? "landing:registration_deactivated_text" : "");
    if (isStringEmpty(textKey)) {
      return null;
    }
    return (
      <div>
        <Typography component="em" variant={"body1"}>{t(textKey)}</Typography>
      </div>
    );
  }

  return (
    <>
      <BackToListButton onBackToList={navigateToRunningDinnerEventList} mb={-4} mt={2} />
      <PageTitle>{publicSettings.title}</PageTitle>
      <Box>
        <div style={{ display: 'flex', marginTop: "-15px" }}>
          <LocationOnIcon color={"primary"} />
          <Paragraph><AddressLocation cityName={publicRunningDinner.city} zip={publicRunningDinner.zip} /></Paragraph>
        </div>
        <div style={{ display: 'flex', marginTop: "15px" }}>
          <CalendarTodayIcon color={"primary"} />
          <Paragraph><LocalDate date={publicRunningDinner.date} /></Paragraph>
        </div>
      </Box>

      <Box mt={2}>
        <FormFieldset>{t("common:schedule")}</FormFieldset>
        <List dense={true} disablePadding>
          { publicRunningDinner.meals.map(meal => renderMealListItem(meal)) }
        </List>
      </Box>

      <Box mt={2}>
        <FormFieldset>{t("common:description")}</FormFieldset>
        <Paragraph>{publicSettings.description}</Paragraph>
      </Box>

      { isPublicContactInfoAvailable &&
        <Box mt={2}>
          <FormFieldset>{t("common:contact")}</FormFieldset>
          {isStringNotEmpty(publicSettings.publicContactName) && <Paragraph>{t("common:organizer")}: {publicSettings.publicContactName}</Paragraph>}
          {isStringNotEmpty(publicSettings.publicContactEmail) && <Paragraph>{t("common:email")}: &nbsp;
              <Link href={`mailto:${publicSettings.publicContactEmail}`}>{publicSettings.publicContactEmail}</Link>
            </Paragraph>}
          {isStringNotEmpty(publicSettings.publicContactMobileNumber) && <Paragraph>{t("common:mobile")}: {publicSettings.publicContactMobileNumber}</Paragraph>}
        </Box> }

      <Box mt={2}>
        <FormFieldset>{t("common:registration")}</FormFieldset>
        <Paragraph i18n={"landing:dinner_event_deadline_text"} parameters={{ endOfRegistrationDate: endOfRegistrationDateStr}} />
      </Box>

      <Box my={2}>
        { renderRegistrationNotPossibleText() }
        { !registrationButtonHidden &&
            <PrimaryButton size={"large"} onClick={openRegistrationForm}>
              {t('landing:goto_registration')}
            </PrimaryButton>
        }
      </Box>

      { isRegistrationFormOpen && <PublicDinnerEventRegistrationForm publicDinnerId={publicSettings.publicDinnerId}
                                                                     onRegistrationPerformed={handleRegistrationPerformed}
                                                                     onCancel={closeRegistrationForm} /> }

    </>
  );
}
