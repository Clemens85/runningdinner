import React from 'react';
import {FormProvider, useFieldArray, useForm, useFormContext} from "react-hook-form";
import FormTextField from '../common/input/FormTextField';

interface MyMeal {
  label: string;
  time: Date;
}
interface Options {
  foo: number;
  meals: MyMeal[];
}

const defaultOptions = {
  foo: 2,
  meals: [
    { label: "X", time: new Date() },
    { label: "Y", time: new Date() }
  ]
};

export default function FormArrayIssue() {

  const formMethods = useForm({
    defaultValues: defaultOptions,
    mode: 'onTouched'
  });

  const { clearErrors, reset, register, handleSubmit } = formMethods;

  React.useEffect(() => {
    reset(defaultOptions);
    console.log(`Resetting: ${JSON.stringify(defaultOptions)}`)
    clearErrors();
  }, [reset, clearErrors]);

  async function showValues(values: unknown) {
    console.log("Running showValues");
    alert(`Submitted Result: ${JSON.stringify(values)}`)
  }

  return (
      <div>
        <FormProvider {...formMethods}>
          <form>
            <div>
              Foo: <input name="foo" ref={register} />
            </div>
            <MyMealsSection />
            <div>
              <button onClick={handleSubmit(showValues)} type={"button"}>SUBMIT</button>
            </div>
          </form>
        </FormProvider>
      </div>
  );
}

function MyMealsSection() {
  const {control, getValues, register} = useFormContext();

  const { fields, append } = useFieldArray({
    control,
    name: "meals",
    keyName: "key"
  });

  function handleAddMeal() {
    append({ label: 'NEW FIELD', time: new Date()});
    alert(`Options: ${JSON.stringify(getValues())}`);
  }

  return (
      <div>
        <div>
          {fields.map((field, index) => (
            <div key={field.key}>
              Label: {field.label}
              <FormTextField name={`meals[${index}].label`} label={""} variant={"outlined"} defaultValue={field.label} />
              {/*<input name={`meals[${index}].label`} ref={register} defaultValue={field.label} />*/}
            </div>

          ))}
        </div>
        <div>
          <button onClick={handleAddMeal} type={"button"}>Add</button>
        </div>
      </div>
  );
}
