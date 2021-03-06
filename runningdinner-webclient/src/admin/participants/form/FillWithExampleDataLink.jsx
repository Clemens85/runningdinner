import React from "react";
import Link from "@material-ui/core/Link";
import ParticipantService from "../../../shared/admin/ParticipantService";
import {getKeyValueList} from "../../../shared/Utils";
import {useFormContext} from "react-hook-form";
import {useTranslation} from "react-i18next";

export default function FillWithExampleDataLink() {

  const {t} = useTranslation('admin');

  const { setValue } = useFormContext();

  function setExampleData() {
    const exampleDataAsList = getKeyValueList(ParticipantService.newExampleParticipantInstance());
    for (let i = 0; i < exampleDataAsList.length; i++) {
      const exampleDataEntry = exampleDataAsList[i];
      setValue(exampleDataEntry.key, exampleDataEntry.value);
    }
  }

  return (
      <Link component="button" type="button" variant="body2" onClick={setExampleData}>{t('fill_with_example_data')}</Link>
  );
}
