import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { CONSTANTS, LabelValue,ValueTranslate } from '@runningdinner/shared';
import { Controller,useFormContext } from 'react-hook-form';

import ParticipantGenderIcon from '../../../common/gender/ParticipantGenderIcon';
import ParticipantGenderTooltip from '../../../common/gender/ParticipantGenderTooltip';

export default function ParticipantGenderSelection(props: LabelValue) {
  const { label, value: fieldName } = props;

  const { control } = useFormContext();

  return (
    <div id="gender">
      <Typography variant="caption" display="block">
        {label}
      </Typography>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => <ParticipantGenderSelectionFormController onChange={(newVal) => field.onChange(newVal)} value={field.value} />}
      />
    </div>
  );
}

type ParticipantGenderSelectionFormControllerProps = {
  value?: string;
  onChange: (newVal: string) => unknown;
};

function ParticipantGenderSelectionFormController({ onChange, value }: ParticipantGenderSelectionFormControllerProps) {
  const gender = value;
  const iconColors = {
    MALE: gender === CONSTANTS.GENDER.MALE ? 'primary' : 'default',
    FEMALE: gender === CONSTANTS.GENDER.FEMALE ? 'primary' : 'default',
    UNDEFINED: gender === CONSTANTS.GENDER.UNDEFINED ? 'primary' : 'default',
  };

  return (
    <Grid container alignItems={'center'}>
      <Grid item>
        <Box>
          <ParticipantGenderTooltip gender={CONSTANTS.GENDER.MALE}>
            <ParticipantGenderIcon color={iconColors.MALE} gender={CONSTANTS.GENDER.MALE} onClick={() => onChange(CONSTANTS.GENDER.MALE)} />
          </ParticipantGenderTooltip>
        </Box>
      </Grid>
      <Grid item>
        <Box>
          <ParticipantGenderTooltip gender={CONSTANTS.GENDER.UNDEFINED}>
            <ParticipantGenderIcon color={iconColors.UNDEFINED} gender={CONSTANTS.GENDER.UNDEFINED} onClick={() => onChange(CONSTANTS.GENDER.UNDEFINED)} />
          </ParticipantGenderTooltip>
        </Box>
      </Grid>
      <Grid item>
        <Box>
          <ParticipantGenderTooltip gender={CONSTANTS.GENDER.FEMALE}>
            <ParticipantGenderIcon color={iconColors.FEMALE} gender={CONSTANTS.GENDER.FEMALE} onClick={() => onChange(CONSTANTS.GENDER.FEMALE)} />
          </ParticipantGenderTooltip>
        </Box>
      </Grid>
      {gender && (
        <Grid item>
          <Box ml={2}>
            <Typography variant={'caption'}>
              <ValueTranslate value={gender} ns="common" prefix="gender" valueMapping={{ undefined: 'unknown' }} />
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}
