import { get } from 'lodash-es';
import { filter } from 'lodash-es';
import { cloneDeep } from 'lodash-es';
import { remove } from 'lodash-es';
import { isArray } from 'lodash-es';
import { BaseEntity } from './types';
import { truncate } from 'lodash-es';
import { mergeWith } from 'lodash-es';
import { isString } from 'lodash-es';
import { trim } from 'lodash-es';
import { isObjectLike } from 'lodash-es';
import { isDate } from 'lodash-es';
import { forIn } from 'lodash-es';
import { set } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';

/**
 * Iterates the passed list and tries to find the entity with the passed id.
 * @param entities
 * @param id
 * @returns {*} the found entity or null
 */
export function findEntityById(entities: any, id?: string | null) {
  if (!entities || !id) {
    return null;
  }
  const result = filter(entities, { id: id });
  if (!result || result.length !== 1) {
    return null;
  }
  return result[0];
}

export function isSameEntity(entity1: any, entity2: any): boolean {
  return entity1 && entity2 && entity1.id === entity2.id;
}

export function isNewEntity(entity: any): boolean {
  if (!entity) {
    return true;
  }
  const id = get(entity, 'id', null);
  if (!id) {
    return true;
  }
  const len = id.length;
  return !len || len <= 0;
}

export function mapNullFieldsToEmptyStrings(obj: any, ...fieldsToIgnore: string[]) {
  if (!obj) {
    return obj;
  }
  const resultObj = cloneDeep(obj);
  const fieldNames = Object.keys(resultObj);
  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (fieldsToIgnore.indexOf(fieldName) > -1) {
      continue;
    }
    if (resultObj[fieldName] === null) {
      resultObj[fieldName] = '';
    }
  }
  return resultObj;
}

export function trimStringsInObject(obj: any) {
  if (!obj) {
    return obj;
  }
  const resultObj = cloneDeep(obj);
  _trimStringsInObject(resultObj);
  return resultObj;
}

function _trimStringsInObject(object: any) {
  forIn(object, function (value, key) {
    if (isString(value)) {
      set(object, key, trim(value));
    } else if (!isDate(value) && !Array.isArray(value) && isObjectLike(value)) {
      _trimStringsInObject(value);
    }
  });
}

export function exchangeEntityInList<T extends BaseEntity>(entityList?: Array<T>, entity?: T): Array<T> {
  if (!entity || !entityList) {
    return entityList || [];
  }
  const result = cloneDeep(entityList);
  let entityFoundInList = false;
  for (let i = 0; i < result.length; i++) {
    if (result[i]?.id === entity?.id) {
      result[i] = entity;
      entityFoundInList = true;
      break;
    }
  }
  if (!entityFoundInList) {
    result.push(entity);
  }

  return result;
}

export function removeEntityFromList<T extends BaseEntity>(entityList?: Array<T>, entity?: T): Array<T> | undefined {
  if (!entity || !entityList) {
    return entityList;
  }
  const result = cloneDeep(entityList);
  remove(result, ['id', entity.id]);
  return result;
}

export function removeEntitiesFromList<T extends BaseEntity>(entityList: Array<T>, entitiesToRemove: T[]): Array<T> {
  const result = cloneDeep(entityList);

  const entityIdsToRemove = entitiesToRemove.filter((e) => isStringNotEmpty(e.id)).map((e) => e.id);

  remove(result, (entity) => {
    return entityIdsToRemove.indexOf(entity.id) >= 0;
  });
  return result;
}

// @ts-ignore
export const isClient = !!(
  // @ts-ignore
  (
    typeof window !== 'undefined' && // @ts-ignore
    window.document && // @ts-ignore
    window.document.createElement
  ) // @ts-ignore
);

/**
 * Extracts attributes from the passed object and pass them in an array with following format:<br>
 *   [
 *    { key: "X", value: "1"},
 *    { key: "Y": value: "2"}
 *   ]<br>
 *  This function only extracts the flat attributes with their values from an object (no recursion)
 */
export function getKeyValueList(obj: any): Array<any> {
  if (!obj || isArray(obj)) {
    return [];
  }

  const keys = Object.keys(obj);
  const result = [];

  for (let i = 0; i < keys.length; i++) {
    const keyName = keys[i];
    const value = obj[keyName];
    result.push({
      key: keyName,
      value: value,
    });
  }
  return result;
}

export function isStringEmpty(s?: string | null) {
  return !s || s.length === 0;
}

export function isStringNotEmpty(s?: string | null): s is string {
  return !isStringEmpty(s);
}

export function sayHello() {
  return 'Hello World';
}

export function isArrayNotEmpty<T>(arr?: Array<T>): arr is Array<T> {
  return arr !== undefined && arr !== null && Array.isArray(arr) && arr.length > 0;
}

export function isArrayEmpty(arr?: any) {
  return !isArrayNotEmpty(arr);
}

export function getTruncatedText(text: string, limit: number) {
  if (!text) {
    return '';
  }
  if (text.length <= limit || limit <= 4) {
    return text;
  }
  return truncate(text, { length: limit });
}

export function mapNewLineToHtmlLineBreaks(str: string) {
  return str.replace(new RegExp('\r?\n', 'g'), '<br />');
}

export function newObjectWithDefaultValuesIfNotSet<T>(incomingObj: T, defaultValues: T): T {
  return mergeWith({}, defaultValues, incomingObj, (a, b) => (b === null ? a : undefined));
}

export function isInteger(s: string) {
  return /^[0-9]*$/.test(s);
}

export function isDefined<T>(obj: T) {
  return obj !== undefined && obj !== null;
}

export function assertDefined<T>(obj: T | undefined): asserts obj is T {
  if (!isDefined(obj)) {
    throw 'Passed obj should be not-null but was null or undefined';
  }
}

export function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

export function isDarkColor(color: any) {
  // Variables for red, green, blue values
  let r, g, b;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If hex --> Convert it to RGB: http://gist.github.com/983661
    color = +('0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  return hsp <= 87.5;
}

export function newUuid() {
  return uuidv4();
}

export function removeIdsFromEntitiesIfNotContainedInExistingEntities<T extends BaseEntity>(entitiesToSave: T[], existingEntities: T[]): T[] {
  const result = cloneDeep(entitiesToSave);
  // Get new added meals, by filtering those mealsToSave which are not contained in incomingMeals:
  for (let i = 0; i < result.length; i++) {
    const existingMealForMealToSave = findEntityById(existingEntities, result[i].id || '');
    if (!existingMealForMealToSave) {
      // Remove id for new added meal, so that backend can assign a new id:
      result[i].id = undefined;
    }
  }
  return result;
}
