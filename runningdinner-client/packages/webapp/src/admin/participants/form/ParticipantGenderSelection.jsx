import React, {useEffect, useState} from 'react'
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import ParticipantGenderTooltip from "../../../common/gender/ParticipantGenderTooltip";
import ParticipantGenderIcon from "../../../common/gender/ParticipantGenderIcon";
import {useFormContext} from "react-hook-form";
import { ValueTranslate, CONSTANTS } from "@runningdinner/shared";

// See: https://levelup.gitconnected.com/getting-forms-right-in-react-3c0f15420d61
export default function ParticipantGenderSelection(props) {

  const fieldName = props.name;

  const { setValue, register, getValues } = useFormContext();
  const [ internalValue, setInternalValue ] = useState(getValues(fieldName));

  const setGender = React.useCallback(newGender => {
    setValue(fieldName, newGender);
    setInternalValue(newGender);
  }, [fieldName, setValue]);

  useEffect(() => {
    register({ name: fieldName});
    setGender(getValues(fieldName));
  }, [register, fieldName, setGender, getValues]);

  const gender = internalValue;
  const iconColors = {
    MALE: gender === CONSTANTS.GENDER.MALE ? 'primary' : 'default',
    FEMALE: gender === CONSTANTS.GENDER.FEMALE ? 'primary' : 'default',
    UNDEFINED: gender === CONSTANTS.GENDER.UNDEFINED ? 'primary' : 'default'
  };

  const {label} = props;

  // let genderDescriptionI18nKey = 'gender_' + gender.toLowerCase();
  // if (genderDescriptionI18nKey === 'gender_undefined') {
  //   genderDescriptionI18nKey = 'gender_unknown';
  // }
  // const genderDescription = t(genderDescriptionI18nKey);

  return (
      <>
        <Typography variant="caption" display="block">
          {label}
        </Typography>
        <Grid container alignItems={"center"}>
          <Grid item>
            <Box>
              <ParticipantGenderTooltip gender={CONSTANTS.GENDER.MALE}>
                <ParticipantGenderIcon color={iconColors.MALE} gender={CONSTANTS.GENDER.MALE} onClick={() => setGender(CONSTANTS.GENDER.MALE)}></ParticipantGenderIcon>
              </ParticipantGenderTooltip>
            </Box>
          </Grid>
          <Grid item>
            <Box>
              <ParticipantGenderTooltip gender={CONSTANTS.GENDER.UNDEFINED}>
                <ParticipantGenderIcon color={iconColors.UNDEFINED} gender={CONSTANTS.GENDER.UNDEFINED} onClick={() => setGender(CONSTANTS.GENDER.UNDEFINED)}></ParticipantGenderIcon>
              </ParticipantGenderTooltip>
            </Box>
          </Grid>
          <Grid item>
            <Box>
              <ParticipantGenderTooltip gender={CONSTANTS.GENDER.FEMALE}>
                <ParticipantGenderIcon color={iconColors.FEMALE}
                                       gender={CONSTANTS.GENDER.FEMALE}
                                       onClick={() => setGender(CONSTANTS.GENDER.FEMALE)} />
              </ParticipantGenderTooltip>
            </Box>
          </Grid>
          <Grid item>
            <Box ml={2}>
              <Typography variant={"caption"}><ValueTranslate value={gender} ns="common" prefix="gender" valueMapping={{'undefined': 'unknown'}}/></Typography>
            </Box>
          </Grid>
        </Grid>
      </>
  );

}
