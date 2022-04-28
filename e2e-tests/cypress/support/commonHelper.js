import {getByTestId} from "./index";

export function assertGenderSelected(genderStr) {
  const genderStrLower = genderStr.toLowerCase();
  return getByTestId(`gender-${genderStrLower}-action`)
          .should("have.class", "MuiIconButton-colorPrimary");
}