import React from 'react'
import CustomSwitch from "../../../common/input/CustomSwitch";
import {isStringEmpty} from "../../../shared/Utils";
import FormFieldset from "../../../common/theme/FormFieldset";
import {useFormContext} from "react-hook-form";
import {Grid} from "@material-ui/core";
import TextInput from "../../../common/input/TextInput";
import CheckboxWithLabel from "../../../common/input/CheckboxWithLabel";
import {useTranslation} from "react-i18next";

export default function MealSpecificsSection() {

  const {t} = useTranslation('common');

  const {getValues} = useFormContext();
  const currentMealSpecificsNote = getValues('mealSpecificsNote');
  const hasMealSpecifics = !isStringEmpty(currentMealSpecificsNote);

  const [mealSpecificsNoteActivated, setMealSpecificsNoteActivated] = React.useState(hasMealSpecifics);

  React.useEffect(() => {
    activateMealSpecificsNote(hasMealSpecifics);
  }, [hasMealSpecifics]);

  function activateMealSpecificsNote(checked) {
    setMealSpecificsNoteActivated(checked);
  }

  return (
      <>
        <FormFieldset>{t('mealspecifics')}</FormFieldset>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <CheckboxWithLabel label={t('vegetarian')} name="vegetarian"/>
          </Grid>
          <Grid item xs={12} md={3}>
            <CheckboxWithLabel label={t('lactose')} name="lactose"/>
          </Grid>
          <Grid item xs={12} md={3}>
            <CheckboxWithLabel label={t('gluten')} name="gluten"/>
          </Grid>
          <Grid item xs={12} md={3}>
            <CheckboxWithLabel label={t('vegan')} name="vegan"/>
          </Grid>
        </Grid>
        <Grid container alignItems={"center"}>
          <Grid item>
            <CustomSwitch checked={mealSpecificsNoteActivated} onChange={(checked) => activateMealSpecificsNote(checked)} />
          </Grid>
          <Grid item>
            <TextInput fullWidth
                        variant={"filled"}
                        disabled={!mealSpecificsNoteActivated}
                        name="mealSpecificsNote"
                        label={t('mealnotes')} />
          </Grid>
        </Grid>
      </>
  );
}
