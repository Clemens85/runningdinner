import axios from 'axios';
import { isDate } from 'lodash-es';
import { isObjectLike } from 'lodash-es';
import { forIn } from 'lodash-es';
import { cloneDeep } from 'lodash-es';
import { endsWith, includes,set } from 'lodash-es';
import { get } from 'lodash-es';

import { deserializeArrayToDate, serializeLocalDateTimeToArray, serializeLocalDateToArray } from './date/DateUtils';

export function configureAxiosHttpInterceptors() {
  // Add a request interceptor
  axios.interceptors.request.use(
    function (config) {
      _appendCacheKiller(config);
      if (config.data) {
        config.data = _serializeRequestData(config.data);
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    },
  );

  // Add a response interceptor
  axios.interceptors.response.use(
    function (response) {
      response.data = deserializeResponseData(response.data);
      return response;
    },
    function (error) {
      return Promise.reject(error);
    },
  );
}

function _appendCacheKiller(config) {
  if (!_isHtmlResource(config.url)) {
    var requestSeparatorChar = '?';
    if (includes(config.url, '?')) {
      requestSeparatorChar = '&';
    }
    config.url += requestSeparatorChar + '_t=' + Date.now();
  }
}

function _isHtmlResource(url) {
  return includes(url, '.html');
}

function _serializeRequestData(requestData) {
  if (!requestData) {
    return null;
  }
  var result = cloneDeep(requestData);
  _serializeDateProperties(result);
  return result;
}

function _serializeDateProperties(object) {
  forIn(object, function (value, key) {
    if (includes(key, 'time') || endsWith(key, 'Time') || key === 'activationDate' || key === 'delieveryFailedDate') {
      var dateTime = get(object, key);
      set(object, key, serializeLocalDateTimeToArray(dateTime));
    } else if (includes(key, 'date') || endsWith(key, 'Date')) {
      var date = get(object, key);
      set(object, key, serializeLocalDateToArray(date));
    } else if (isDate(value)) {
      set(object, key, serializeLocalDateTimeToArray(value));
    } else {
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          _serializeDateProperties(value[i]);
        }
      } else if (isObjectLike(value)) {
        _serializeDateProperties(value);
      }
    }
  });
}

export function deserializeResponseData(responseData) {
  if (!responseData) {
    return null;
  }
  if (Array.isArray(responseData)) {
    for (var i = 0; i < responseData.length; i++) {
      _deserializeDateProperties(responseData[i]);
    }
  } else {
    _deserializeDateProperties(responseData);
  }
  return responseData;
}

function _deserializeDateProperties(object) {
  forIn(object, function (value, key) {
    if (includes(key, 'time') || includes(key, 'date') || endsWith(key, 'Date') || endsWith(key, 'Time') || key === 'createdAt') {
      var dateOrTime = get(object, key);
      set(object, key, deserializeArrayToDate(dateOrTime));
    } else if (isObjectLike(value)) {
      _deserializeDateProperties(value);
    }
  });
}
