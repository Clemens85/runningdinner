import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
  fetchSelfAdminSessionData,
  getLanguageOfDinnerSelfAdmin, isStringNotEmpty,
  Parent,
  useSelfAdminDispatch,
  useSelfAdminSelector
} from "@runningdinner/shared";
import React from "react";
import Grid from "@material-ui/core/Grid";
import {Box} from "@material-ui/core";
import {LanguageSwitch} from "../common/i18n/LanguageSwitch";
import useCommonStyles from "../common/theme/CommonStyles";
import {Helmet} from "react-helmet-async";

export interface SelfAdminPageContainerProps extends Parent {
  htmlPageTitleI18n: string;
}

export function SelfAdminPageContainer({children, htmlPageTitleI18n}: SelfAdminPageContainerProps) {

  const {selfAdminId, participantId} = useParams<Record<string, string>>();

  const { i18n, t } = useTranslation('selfadmin');

  const dispatch = useSelfAdminDispatch();

  const commonStyles = useCommonStyles();

  const dinnerLanguage = useSelfAdminSelector(getLanguageOfDinnerSelfAdmin);

  React.useEffect(() => {
    dispatch(fetchSelfAdminSessionData({selfAdminId, participantId}));
  }, [dispatch, selfAdminId, participantId]);

  React.useEffect(() => {
    if (isStringNotEmpty(dinnerLanguage)) {
      i18n.changeLanguage(dinnerLanguage);
      console.log(`Changed language to ${dinnerLanguage}`);
    }
  }, [dinnerLanguage, i18n]);

  return (
    <>
      <Grid container justify={"center"}>
        <Grid item xs={12} md={8} lg={8} className={commonStyles.textAlignRight}>
          <Box mt={2} mb={-3}>
            <LanguageSwitch />
          </Box>
        </Grid>
      </Grid>
      <Grid container justify={"center"}>
        <Grid item xs={12} md={8} lg={8}>
          {children}
        </Grid>
      </Grid>
      <Helmet>
        <title>{t(htmlPageTitleI18n)}</title>
      </Helmet>
    </>
  );
}