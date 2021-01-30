import { isStringEmpty } from './Utils';

class BackendConfig {

  static _baseUrl: string = '/rest';

  static getBaseUrl() {
    return this._baseUrl;
  }

  static setBaseUrl(baseUrl: string) {
    if (!isStringEmpty(baseUrl)) {
      this._baseUrl = baseUrl;
    }
  }

  static buildUrl(urlPart: string) {
    return this.getBaseUrl() + urlPart;
  }
}

export {
  BackendConfig
};
