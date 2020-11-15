import axios from 'axios';
import BackendConfig from "../BackendConfig";
import {CONSTANTS} from "../Constants";
import cloneDeep from "lodash/cloneDeep";

export default class RunningDinnerService {

  static async findRunningDinnerAsync(adminId) {
    const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}`);
    const response = await axios.get(url);
    return response.data;
  }

  static async updateMealTimesAsync(adminId, meals) {
    const url = BackendConfig.buildUrl(`/runningdinnerservice/v1/runningdinner/${adminId}/mealtimes`);
    const data = {
      meals: cloneDeep(meals)
    };
    const response = await axios.put(url, data);
    return response.data;
  }

  static isClosedDinner(dinner) {
    const registrationType = dinner.basicDetails.registrationType;
    return registrationType === CONSTANTS.REGISTRATION_TYPE.CLOSED;
  }
}
