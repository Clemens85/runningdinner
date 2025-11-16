import axios from 'axios';
import { find } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import { BackendConfig } from '../';
import { LabelValue, MealSpecifics } from '../types';

export async function findRegistrationTypesAsync(): Promise<LabelValue[]> {
  const url = BackendConfig.buildUrl(`/masterdataservice/v1/registrationtypes`);
  const response = await axios.get<LabelValue[]>(url);
  return response.data;
}

export async function findGenderAspectsAsync(): Promise<LabelValue[]> {
  const url = BackendConfig.buildUrl(`/masterdataservice/v1/genderaspects`);
  const response = await axios.get<LabelValue[]>(url);
  return response.data;
}

export async function findGendersAsync(): Promise<LabelValue[]> {
  const url = BackendConfig.buildUrl(`/masterdataservice/v1/genders`);
  const response = await axios.get<LabelValue[]>(url);
  return response.data;
}

export function getByValue(value: string, labelValues: LabelValue[]): LabelValue | undefined {
  const result = find(labelValues, ['value', value]);
  return result;
}

export function useMealSpecificsStringify(mealSpecifics?: MealSpecifics) {
  const { t } = useTranslation('common');

  function getMealSpecificsAsString(mealSpecifics?: MealSpecifics): string {
    let result = '';
    if (!mealSpecifics) {
      return result;
    }

    if (mealSpecifics.vegetarian === true) {
      result += t('vegetarian') + ', ';
    }
    if (mealSpecifics.vegan === true) {
      result += t('vegan') + ', ';
    }
    if (mealSpecifics.lactose === true) {
      result += t('lactose') + ', ';
    }
    if (mealSpecifics.gluten === true) {
      result += t('gluten') + ', ';
    }

    if (result.length > 0) {
      result = result.trim().slice(0, -1);
    }
    return result;
  }

  return getMealSpecificsAsString(mealSpecifics);
}
