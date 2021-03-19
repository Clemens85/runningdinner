import React from 'react';
import {PageTitle, Span} from "../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {SpacingGrid} from "../common/theme/SpacingGrid";
import Paragraph from "../common/theme/typography/Paragraph";
import {useWizardSelector} from "./WizardStore";
import {getAdministrationUrlSelector} from "./WizardSlice";
import LinkExtern from "../common/theme/LinkExtern";
import {Typography} from "@material-ui/core";

export default function SummaryStep() {

  const {t} = useTranslation(['wizard', 'common']);
  const administrationUrl = useWizardSelector(getAdministrationUrlSelector);

  return (
      <div>
        <PageTitle>{t('done')}</PageTitle>
        <SpacingGrid container>
          <SpacingGrid item xs={12}>
            <Span i18n="wizard:administration_link" />
            <Paragraph><strong>{administrationUrl}</strong></Paragraph>
            <Span i18n="wizard:administration_link_help" />
          </SpacingGrid>
        </SpacingGrid>

        <SpacingGrid container>
          <SpacingGrid item xs={12} md={6}>
            <LinkExtern href={administrationUrl} self={true}>
              <Typography variant={"body1"} component={"span"}>{t('wizard:administration_link_open')}</Typography>
            </LinkExtern>
          </SpacingGrid>
        </SpacingGrid>
      </div>
  );
}
