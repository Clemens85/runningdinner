import { findTeamsAsync, isArrayNotEmpty, isStringNotEmpty, Meal } from '@runningdinner/shared';

export async function shouldShowDropTeamsConfirmationOnMealsUpdate(adminId: string, mealsToUpdate: Meal[], existingMeals: Meal[]): Promise<boolean> {
  let needToQueryTeams = false;

  const existingMealsToUpdate = mealsToUpdate.filter((m) => isStringNotEmpty(m.id));
  if (existingMealsToUpdate.length !== mealsToUpdate.length) {
    // New meal(s) added -> teams need to be dropped if existing
    needToQueryTeams = true;
  }

  // This case handles recognition of drop of meals (if we have same meal sizes, then there was no addition or removal of meals (if clause above was not true))
  if (mealsToUpdate.length !== existingMeals.length) {
    // Number of meals changed -> teams need to be dropped if existing
    needToQueryTeams = true;
  }

  if (!needToQueryTeams) {
    return Promise.resolve(false);
  }

  const teams = await findTeamsAsync(adminId);
  return Promise.resolve(isArrayNotEmpty(teams));
}
