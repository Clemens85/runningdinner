import get from "lodash/get";
import filter from "lodash/filter";
import cloneDeep from "lodash/cloneDeep";
import remove from "lodash/remove";
import isArray from "lodash/isArray";
import {BaseEntity} from "./types";
import truncate from "lodash/truncate";
import mergeWith from 'lodash/mergeWith';
import isString from 'lodash/isString';
import trim from 'lodash/trim';
import isObjectLike from "lodash/isObjectLike";
import isDate from "lodash/isDate";
import forIn from "lodash/forIn";
import set from "lodash/set";
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

  const result = filter(entities, { 'id': id });
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
  const id = get(entity, "id", null);
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
    let fieldName = fieldNames[i];
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
  forIn(object, function(value, key) {
    if(isString(value)) {
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
  remove(result, [ 'id', entity.id ]);
  return result;
}

// @ts-ignore
export const isClient = !!(
    // @ts-ignore
    typeof window !== 'undefined' // @ts-ignore
    && window.document // @ts-ignore
    && window.document.createElement // @ts-ignore
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
      value: value
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


export function isArrayNotEmpty<T>(arr?: Array<T>): arr is Array<T> {
  return arr !== undefined && arr !== null && Array.isArray(arr) && arr.length > 0;
}

export function isArrayEmpty(arr?: any) {
  return !isArrayNotEmpty(arr);
}

export function getTruncatedText(text: string, limit: number) {
  if (!text) {
    return "";
  }
  if (text.length <= limit || limit <= 4) {
    return text;
  }
  return truncate(text, { length: limit });
}

export function mapNewLineToHtmlLineBreaks(str: string) {
  return str.replace(new RegExp('\r?\n','g'), '<br />');
}


export function newObjectWithDefaultValuesIfNotSet<T>(incomingObj: T, defaultValues: T): T {
  return mergeWith(
    {}, defaultValues, incomingObj,
    (a, b) => b === null ? a : undefined
  );
}