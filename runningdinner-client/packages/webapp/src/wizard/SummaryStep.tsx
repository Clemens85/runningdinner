import React from 'react';
import {PageTitle, Span} from "../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {SpacingGrid} from "../common/theme/SpacingGrid";
import Paragraph from "../common/theme/typography/Paragraph";
import {useWizardSelector} from "./WizardStore";
import {getAdministrationUrlSelector} from "./WizardSlice";
import LinkExtern from "../common/theme/LinkExtern";

export default function SummaryStep() {

  const {t} = useTranslation(['wizard', 'common']);
  const administrationUrl = useWizardSelector(getAdministrationUrlSelector);

  return (
      <div>
        <PageTitle>{t('done')}</PageTitle>
        <SpacingGrid container>
          <SpacingGrid item xs={12} md={6}>
            <Span i18n="wizard:administration_link" />
            <Paragraph><strong>{administrationUrl}</strong></Paragraph>
            <Span i18n="wizard:administration_link_help" />
          </SpacingGrid>
        </SpacingGrid>

        <SpacingGrid container>
          <SpacingGrid item xs={12} md={6}>
            <LinkExtern href={administrationUrl} title={t('wizard:administration_link_open')} />
          </SpacingGrid>
        </SpacingGrid>
      </div>
  );
}
