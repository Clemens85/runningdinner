import React from 'react';
import { getKeyValueList, newExampleParticipantInstance } from '@runningdinner/shared';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import LinkAction from '../../../common/theme/LinkAction';

export default function FillWithExampleDataLink() {
  const { t } = useTranslation('admin');

  const { setValue } = useFormContext();

  function setExampleData() {
    const exampleDataAsList = getKeyValueList(newExampleParticipantInstance());
    for (let i = 0; i < exampleDataAsList.length; i++) {
      const exampleDataEntry = exampleDataAsList[i];
      setValue(exampleDataEntry.key, exampleDataEntry.value);
    }
  }

  return (
    <LinkAction onClick={setExampleData} variant={'body2'}>
      {t('fill_with_example_data')}
    </LinkAction>
  );
}
