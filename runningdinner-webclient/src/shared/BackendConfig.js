import {isStringEmpty} from "./Utils";

export default class BackendConfig {

  static _baseUrl = '/rest';

  static getBaseUrl() {
    return this._baseUrl;
  }

  static setBaseUrl(baseUrl) {
    if (!isStringEmpty(baseUrl)) {
      this._baseUrl = baseUrl;
    }
  }

  static buildUrl(urlPart) {
    return this.getBaseUrl() + urlPart;
  }
}
