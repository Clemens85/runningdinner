import React, {useState} from 'react'
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import {Controller, useForm} from "react-hook-form";
import TextField from "@material-ui/core/TextField";

export default function FormTest() {

  const [plain, setPlain] = useState('');
  const [material, setMaterial] = useState('');
  const [f, setF] = useState({ value: ''});

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      value: 'default'
    }
  });

  const watchedValue = watch('value');

  function handleChangePlain(changeEvt) {
    setPlain(changeEvt.target.value);
  }

  function handleChangeMaterial(changeEvt) {
    setMaterial(changeEvt.target.value);
  }

  const performSubmit = (values) => {
    setF(values);
  };

  return (
      <Grid container>
        <Grid item xs={12}>

          <Box m={3}>
            <input type="text" name="plain" onChange={handleChangePlain} value={plain} style={{width: '100%'}}/>
            <div>Plain value: {plain}</div>
          </Box>

          <Box m={3}>
            <TextField name="material" value={material} onChange={handleChangeMaterial} fullWidth label="Material" variant={"outlined"} />
            <div>Material value: {material}</div>
          </Box>

          <Box m={3}>
            <form>
                  <Controller as={TextField}
                              control={control}
                              fullWidth
                              required
                              variant="filled"
                              name="value"
                              label="Formik" />

                  <div>F value: {f.value}</div>
                  <div>F Live value: {watchedValue}</div>
                  <PrimaryButton onClick={handleSubmit(performSubmit)} color="primary" variant="contained">Submit</PrimaryButton>
            </form>
          </Box>


        </Grid>
      </Grid>
  );

}
