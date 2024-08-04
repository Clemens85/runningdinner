import React from "react";
import { cloneDeep, remove } from "lodash-es";
import { buildMealTypeMappings, DinnerRouteMapData, DinnerRouteTeamMapEntry, MealType, TeamConnectionPath } from "./DinnerRouteMapCalculationService";
import { AfterPartyLocation, BaseRunningDinnerProps, DinnerRouteTeam, Meal, Parent, RunningDinner, Team } from "../../types";
import { isAfterPartyLocationDefined } from "../RunningDinnerService";
import { findEntityById, isSameEntity } from "../../Utils";
import { Fullname } from "../../Fullname";
import { Time } from "../../date";

export const ALL_MEALS_OPTION: Meal = {
  label: "Alle",
  id: "ALL",
  time: new Date()
};

export type DinnerRouteOverviewState = {
  activeTeamsFilter: Record<number, DinnerRouteTeamMapEntry>;
  hostFilterViewMinimized: boolean;
  settingsViewMinimized: boolean;
  mealFilter: Meal;
  mealFilterOptions: Meal[];
  excludeAfterPartyLocation: boolean;

  meals: Meal[];
  mealTypeMappings: Record<string, MealType>;

  afterPartyLocation?: AfterPartyLocation;
};

const INITIAL_STATE_TEMPLATE: DinnerRouteOverviewState = {
  activeTeamsFilter: {},
  hostFilterViewMinimized: false,
  settingsViewMinimized: false,
  excludeAfterPartyLocation: false,
  mealFilterOptions: [],
  mealFilter: ALL_MEALS_OPTION,
  mealTypeMappings: {},
  meals: [],
};

export enum DinnerRouteOverviewActionType {
  UPDATE_MEAL_FILTER,
  UPDATE_SETTINGS_VIEW_MINIMIZED,
  UPDATE_HOST_FILTER_VIEW_MINIMIZED,
  TOGGLE_ACTIVE_TEAM,
  TOGGLE_EXCLUDE_AFTER_PARTY_LOCATION
}

type Action = {
  type: DinnerRouteOverviewActionType;
  payload?: any;
}

type DinnerRouteOverviewContextType = {
  state: DinnerRouteOverviewState;
  dispatch: React.Dispatch<Action>;
}


function newInitialState(runningDinner: RunningDinner) {
  const result = cloneDeep(INITIAL_STATE_TEMPLATE);
  result.afterPartyLocation = isAfterPartyLocationDefined(runningDinner.afterPartyLocation) ? cloneDeep(runningDinner.afterPartyLocation) : runningDinner.afterPartyLocation;
  result.meals = cloneDeep(runningDinner.options.meals);

  result.mealFilterOptions = buildMealFilterOptions(result.meals, result.afterPartyLocation, false);
  result.mealTypeMappings = buildMealTypeMappings(result.meals);
  result.mealFilter = ALL_MEALS_OPTION;

  return result;
}

function buildMealFilterOptions(incomingMeals: Meal[], afterPartyLocation: AfterPartyLocation | undefined, excludeAfterPartyLocation: boolean): Meal[] {
  const result = [
    ALL_MEALS_OPTION
  ];
  for (let i = 0; i < incomingMeals.length; i++) {
    const meal = cloneDeep(incomingMeals[i]);
    if (i + 1 < incomingMeals.length) {
      meal.label = meal.label + " => " + incomingMeals[i + 1].label;
      result.push(meal);
    } else if (isAfterPartyLocationDefined(afterPartyLocation) && !excludeAfterPartyLocation) {
      meal.label = meal.label + " => " + afterPartyLocation?.title;
      result.push(meal);
    }
  }
  return result;
}

function getLastMeal(meals: Meal[]): Meal {
  return meals[meals.length - 1];
}

const DinnerRouteOverviewContext = React.createContext<DinnerRouteOverviewContextType>({
  state: INITIAL_STATE_TEMPLATE,
  dispatch: () => {}
});


function filterActiveTeams(activeTeamsFilter: Record<number, DinnerRouteTeamMapEntry>) {
  const result = new Array<DinnerRouteTeamMapEntry>();
  Object.keys(activeTeamsFilter).forEach((teamNumber) => {
    const activeDinnerRouteTeamMapEntry = activeTeamsFilter[parseInt(teamNumber)];
    if (activeDinnerRouteTeamMapEntry) {
      result.push(activeDinnerRouteTeamMapEntry);
    }
  });
  return result;
}

export function filterTeamConnectionPaths(dinnerRouteMapData: DinnerRouteMapData, state: DinnerRouteOverviewState): DinnerRouteTeamMapEntry[] {
  
  const {dinnerRouteMapEntries} = dinnerRouteMapData;
  const {activeTeamsFilter, mealFilter} = state;

  let result = filterActiveTeams(activeTeamsFilter);
  if (result.length === 0) {
    result = dinnerRouteMapEntries;
  }  
  result = cloneDeep(result);

  for (let i = 0; i < result.length; i++) {
    const currentEntry = result[i];
    const currentTeamConnectionPaths = currentEntry.teamConnectionPaths;
 
    remove(currentTeamConnectionPaths, path => { return !isIncludedInMealFilter(mealFilter, path, state.excludeAfterPartyLocation); });

    // This removes all paths that are connected to the after party location (entry with after party location has no team set)
    if (state.excludeAfterPartyLocation) {
      remove(currentTeamConnectionPaths, (path) => !path.team);
    }
  }

  return result;
}

function isIncludedInMealFilter(mealFilter: Meal, teamConnectionPath: TeamConnectionPath, excludeAfterPartyLocation: boolean): boolean {
  if (isSameEntity(mealFilter, ALL_MEALS_OPTION)) {
    return true;
  }

  if (excludeAfterPartyLocation && !teamConnectionPath.team) {
    return false;
  }
  if (isSameEntity(teamConnectionPath.team?.meal, mealFilter)) {
    return true;
  }
  return false;
}

function dinnerRouteOverviewReducer(state: DinnerRouteOverviewState, action: Action): DinnerRouteOverviewState {

  const result = cloneDeep(state);

  switch (action.type) {
    case DinnerRouteOverviewActionType.UPDATE_MEAL_FILTER: {
      result.mealFilter = findEntityById(result.mealFilterOptions, action.payload);
      if (!result.mealFilter) {
        result.mealFilter = ALL_MEALS_OPTION;
      }
      return result;
    }
    case DinnerRouteOverviewActionType.UPDATE_HOST_FILTER_VIEW_MINIMIZED: {
      result.hostFilterViewMinimized = action.payload;
      return result;
    }
    case DinnerRouteOverviewActionType.UPDATE_SETTINGS_VIEW_MINIMIZED: {
      result.settingsViewMinimized = action.payload;
      return result;
    }
    case DinnerRouteOverviewActionType.TOGGLE_ACTIVE_TEAM: {
      const dinnerRouteTeam = action.payload as DinnerRouteTeamMapEntry;
      if (result.activeTeamsFilter[dinnerRouteTeam.teamNumber]) {
        delete result.activeTeamsFilter[dinnerRouteTeam.teamNumber];
      } else {
        result.activeTeamsFilter[dinnerRouteTeam.teamNumber] = dinnerRouteTeam;
      }
      return result;
    }
    case DinnerRouteOverviewActionType.TOGGLE_EXCLUDE_AFTER_PARTY_LOCATION: {
      result.excludeAfterPartyLocation = !result.excludeAfterPartyLocation;
      result.mealFilterOptions = buildMealFilterOptions(result.meals, result.afterPartyLocation, result.excludeAfterPartyLocation);
      if (isSameEntity(result.mealFilter, getLastMeal(result.meals)) && 
          result.excludeAfterPartyLocation && 
          isAfterPartyLocationDefined(result.afterPartyLocation)) {
        result.mealFilter = ALL_MEALS_OPTION; // Reset due to Nachspeise => AfterEventParty is not possible anymore
      }
      return result;
    }
  }
}

type DinnerRouteOverviewContextProviderProps = BaseRunningDinnerProps & Parent;

export function DinnerRouteOverviewContextProvider({children, runningDinner}: DinnerRouteOverviewContextProviderProps) {

  const [state, dispatch] = React.useReducer(dinnerRouteOverviewReducer, newInitialState(runningDinner));
  const value = {state, dispatch};
  return <DinnerRouteOverviewContext.Provider value={value}>{children}</DinnerRouteOverviewContext.Provider>
}


export function useDinnerRouteOverviewContext() {
  const context = React.useContext(DinnerRouteOverviewContext);
  if (context === undefined) {
    throw new Error('useDinnerRouteOverviewContext must be used within a DinnerRouteOverviewContextProvider');
  }
  return context;
}

export function getDinnerRouteTeamLabel(team: DinnerRouteTeam | Team, includeHostFullname: boolean, includeMealTime: boolean) {

  const teamWithMealLabel = <>Team #{team.teamNumber} ({team.meal.label}) </>;
  const mealTimeLabel = includeMealTime ? <> (<Time date={team.meal.time} />)</> : null;

  return (
    <>
      {teamWithMealLabel}
      {mealTimeLabel}
      { includeHostFullname ? <> - <Fullname {...team.hostTeamMember} /></> : null }
    </>
  );
}