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
import Grid from "@mui/material/Grid";
import {Box} from "@mui/material";
import {LanguageSwitch} from "../common/i18n/LanguageSwitch";
import {SuperSEO} from "react-super-seo";
import {commonStyles} from "../common/theme/CommonStyles";

export interface SelfAdminPageContainerProps extends Parent {
  htmlPageTitleI18n: string;
}

export function SelfAdminPageContainer({children, htmlPageTitleI18n}: SelfAdminPageContainerProps) {

  const urlParams = useParams<Record<string, string>>();
  const selfAdminId = urlParams.selfAdminId || "";
  const participantId = urlParams.participantId || "";

  const { i18n, t } = useTranslation('selfadmin');

  const dispatch = useSelfAdminDispatch();

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

  return <>
    <Grid container justifyContent={"center"}>
      <Grid item xs={12} md={8} lg={8} sx={commonStyles.textAlignRight}>
        <Box mt={2} mb={-3}>
          <LanguageSwitch />
        </Box>
      </Grid>
    </Grid>
    <Grid container justifyContent={"center"}>
      <Grid item xs={12} md={8} lg={8}>
        {children}
      </Grid>
    </Grid>
    <SuperSEO title={t(htmlPageTitleI18n)} />
  </>;
}