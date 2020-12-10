import axios from 'axios';
import clone from 'lodash/clone';
import filter from 'lodash/filter';
import lowerCase from 'lodash/lowerCase';
import includes from 'lodash/includes';
import BackendConfig from "../BackendConfig";
import {CONSTANTS} from "../Constants";
import {isNewEntity} from "../Utils";

const EMPTY_PARTICIPANT = {
  firstnamePart: '',
  lastname: '',
  gender: CONSTANTS.GENDER.UNDEFINED,
  mobileNumber: '',
  email: '',
  street: '',
  streetNr: '',
  zip: '',
  cityName: '',
  age: -1,
  numberSeats: -1,
  vegetarian: false,
  lactose: false,
  gluten:false,
  vegan: false,
  mealSpecificsNote: '',
  numSeats: '',
  addressRemarks: '',
  teamPartnerWish: '',
  notes: ''
};

const EXAMPLE_PARTICIPANT = {
  firstnamePart: 'Max',
  lastname: 'Mustermann',
  gender: CONSTANTS.GENDER.MALE,
  email: 'Max@Mustermann.de',
  street: 'Musterstraße',
  streetNr: '1',
  age: 25,
  numberSeats: 6,
  vegetarian: false,
  gluten: false,
  lactose: false,
  vegan: false
};

export default class ParticipantService {

  static async findParticipantsAsync(adminId) {
    const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participants`);
    const response = await axios.get(url);
    return response.data;
  }

  static async saveParticipantAsync(adminId, participant) {

    let method = 'post';
    let url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participant`);
    if (!isNewEntity(participant)) {
      const {id} = participant;
      url += `/${id}`;
      method = 'put';
    }

    const response = await axios({
      url: url,
      method: method,
      data: participant
    });
    return response.data;
  }

  static async findNotAssignedParticipantsAsync(adminId) {
    const { participants } = await ParticipantService.findParticipantsAsync(adminId);
    const result = ParticipantService.getNotAssignableParticipants(participants);
    return result;
  }

  /**
   * Deletes the passed participant for the passed dinner admin id.
   * @param participant
   * @param adminId
   * @returns {*} Returns the deleted participant so that caller can take further actions (e.g. refresh view e.g.)
   */
  static async deleteParticipantAsync(adminId, participant) {
    const { id } = participant;
    const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participant/${id}`);
    await axios.delete(url);
    return participant;
  }

  static async findTeamPartnerWishInfoAsync(adminId, participant) {
    var statesToIncludeQueryParam = `?relevantState=${CONSTANTS.TEAM_PARTNER_WISH_STATE.NOT_EXISTING}&relevantState=${CONSTANTS.TEAM_PARTNER_WISH_STATE.EXISTS_EMPTY_TEAM_PARTNER_WISH}`;
    const url = BackendConfig.buildUrl(`/participantservice/v1/runningdinner/${adminId}/participant/${participant.id}/team-partner-wish${statesToIncludeQueryParam}`);
    const response = await axios.get(url);
    return response.data;
  }

  static getFullname(participant) {
    if (!participant || (!participant.firstnamePart && !participant.lastname)) {
      return '';
    }
    return participant.firstnamePart + ' ' + participant.lastname;
  }

  static getFullnameList(participants) {
    if (!participants || participants.length === 0) {
      return '';
    }
    const participantNames = participants.map(p => ParticipantService.getFullname(p));
    return participantNames.join(', ');
  }

  static newEmptyParticipantInstance() {
    return clone(EMPTY_PARTICIPANT);
  }

  static newExampleParticipantInstance() {
    return clone(EXAMPLE_PARTICIPANT);
  }

  static getAssignableParticipants(participants) {
    return filter(participants, ['assignmentType', CONSTANTS.ASSIGNMENT_TYPE.ASSIGNABLE]) || [];
  }

  static getNotAssignableParticipants(participants) {
    return filter(participants, ['assignmentType', CONSTANTS.ASSIGNMENT_TYPE.NOT_ASSIGNABLE]) || [];
  }

  static getParticipantsOrganizedInTeams(participants) {
    return filter(participants, ['assignmentType', CONSTANTS.ASSIGNMENT_TYPE.ASSIGNED_TO_TEAM]) || [];
  }

  static searchParticipants(participants, searchText) {
    const searchTextLowerCase = lowerCase(searchText);
    return filter(participants, function(p) {
      let content = ParticipantService.getFullname(p);
      const { email, street, zip, mobileNumber } = p;
      content += ` ${email} ${street} ${mobileNumber} ${zip}`;
      content = lowerCase(content);
      return includes(content, searchTextLowerCase);
    });
  }

  static canHost(participant, numSeatsNeededForHost) {
    return participant.numSeats >= 0 && participant.numSeats >= numSeatsNeededForHost;
  }

  static isNumSeatsUnknown(participant) {
    return participant.numSeats < 0;
  }
}
