import {Trans, useTranslation} from "react-i18next";
import {
  hasTeamPartnerRegistrationData,
  isStringEmpty,
  isStringNotEmpty, RegistrationSummary,
  TeamPartnerWishState,
  useMealSpecificsStringify,
  ValueTranslate
} from "@runningdinner/shared";
import {Box, Typography} from "@mui/material";
import {Span, Subtitle} from "../common/theme/typography/Tags";
import MailIcon from "@mui/icons-material/Mail";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import Paragraph from "../common/theme/typography/Paragraph";
import DoneIcon from "@mui/icons-material/Done";
import { Alert, AlertTitle } from '@mui/material';
import React from "react";

export function RegistrationSummaryContentView(registrationSummary: RegistrationSummary) {

  const {t} = useTranslation(["landing", "common"]);

  const showNotEnoughSeatsMessage = isStringEmpty(registrationSummary.teamPartnerWishEmail) && !registrationSummary.canHost;

  const mealSpecificsAsString = useMealSpecificsStringify(registrationSummary?.mealSpecifics);

  return (
    <>
      <Subtitle i18n={"landing:registration_finish_check"} />
      <Box mb={2}>
        <Span>{registrationSummary.fullname}</Span>
        <Span>{registrationSummary.streetWithNr}</Span>
        <Span>{registrationSummary.zipWithCity}</Span>
        { isStringNotEmpty(registrationSummary.addressRemarks) && <Span><em>{registrationSummary.addressRemarks}</em></Span> }
      </Box>
      <Box mb={2}>
        <div style={{ display: 'flex' }}>
          <MailIcon color={"primary"} />
          <Typography variant={"body1"} component="p" noWrap>&nbsp; {registrationSummary.email}</Typography>
        </div>
        { isStringNotEmpty(registrationSummary.mobile) &&
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <PhoneAndroidIcon color={"primary"} />
            <Paragraph>&nbsp; {registrationSummary.mobile}</Paragraph>
          </div>
        }
      </Box>
      <Box mb={2}>
        { registrationSummary.canHost &&
          <div style={{display: 'flex'}}>
            <DoneIcon color={"primary"}/>
            <Span>&nbsp; {t("landing:registration_can_host")} ({t("common:participant_seats", {numSeats: registrationSummary.numberOfSeats})})</Span>
          </div>
        }
        { showNotEnoughSeatsMessage &&
          <Span>{t("landing:registration_no_host")} ({t("common:participant_seats", {numSeats: registrationSummary.numberOfSeats})})</Span>
        }
      </Box>

      <Box mb={2}>
        <Span>{t('common:gender')}: <ValueTranslate value={registrationSummary.gender} ns="common" prefix="gender" valueMapping={{'undefined': 'unknown'}}/></Span>
        { registrationSummary.ageSpecified && <Span>{t('common:age')}: {registrationSummary.age}</Span> }
        { !registrationSummary.ageSpecified && <Span>{t('common:age')}: {t('landing:gender_unknown')}</Span> }
        { isStringNotEmpty(registrationSummary.notes) && <Span><em>{registrationSummary.notes}</em></Span> }

        { isStringNotEmpty(mealSpecificsAsString) && registrationSummary.mealSpecifics &&
          <Box>
            <Span>{t("mealspecifics_summary_text")}: {mealSpecificsAsString}</Span>
            { isStringNotEmpty(registrationSummary.mealSpecifics.mealSpecificsNote) && <Span><em>{registrationSummary.mealSpecifics.mealSpecificsNote}</em></Span> }
          </Box>
        }
      </Box>

      { isStringNotEmpty(registrationSummary.teamPartnerWishEmail) &&
        <Box mb={2}>
          { !registrationSummary.teamPartnerWishEmail &&
            <Span noWrap={true}>
              <Trans i18nKey={"landing:teampartner_wish_summary"}
                     components={{ italic: <em /> }}
                     values={{ teamPartnerWish: registrationSummary.teamPartnerWishEmail }} />
            </Span> }
          { registrationSummary.teamPartnerWishState === TeamPartnerWishState.EXISTS_SAME_TEAM_PARTNER_WISH &&
            <Span noWrap={true}>
              <Trans i18nKey={"landing:teampartner_wish_summary_match"}
                     components={{ italic: <em /> }}
                     values={{ teamPartnerWish: registrationSummary.teamPartnerWishEmail }} />
            </Span> }
          { registrationSummary.teamPartnerWishState === TeamPartnerWishState.NOT_EXISTING &&
            <Span noWrap={true}><Trans i18nKey={"landing:teampartner_wish_summary_not_existing"}
                                       components={{ italic: <em /> }}
                                       values={{ teamPartnerWish: registrationSummary.teamPartnerWishEmail }} />
            </Span> }
        </Box>
      }

      { hasTeamPartnerRegistrationData(registrationSummary.teamPartnerWishRegistrationData) &&
        <Box mb={2}>
          <Span noWrap={true}>
            <Trans i18nKey={"landing:teampartner_registration_summary_info"}
                   components={{ italic: <em /> }}
                   values={{ firstname: registrationSummary.teamPartnerWishRegistrationData?.firstnamePart,
                     lastname: registrationSummary.teamPartnerWishRegistrationData?.lastname }} />
          </Span>
        </Box>
      }

      { isStringEmpty(registrationSummary.mobile) &&
        <Alert severity={"info"} data-testid={"mobilenumber-missing-attention"}>
          <AlertTitle>{t('common:attention')}</AlertTitle>
          {t('landing:attention_mobilenumber_missing')}
        </Alert>
      }
    </>
  );
}