import * as Yup from "yup";
import {setLocale} from "yup";

setLocale({
  string: {
    required: 'Pflichtfeld',
    max: 'Max. Zeichenanzahl überschritten',
    email: 'Ungültige E-Mail-Adresse'
  }
});

export const PARTICIPANT_VALIDATION_SCHEMA = Yup.object({
  lastname: Yup.string().max(255).required(),
  firstnamePart: Yup.string().max(255).required(),
  email: Yup.string().max(255).required().email(),
  age: Yup.string().matches(/-1|0|^[1-9]$|^[1-9][0-9]$|^(100)$/, "Alter muss zwischen 1 und 100 sein"),
  street: Yup.string().required().max(255),
  streetNr: Yup.string().required().max(255),
  zip: Yup.string().required().max(10),
  cityName: Yup.string().required().max(255),
  numSeats: Yup.string().matches(/-1|0|^[1-9]$|^[1-9][0-9]$|^(100)$/, "Anzahl Plätze wohl kaum über 100 möglich").nullable(),
  teamPartnerWish: Yup.string().email().nullable()
});

export const PARTICIPANT_MESSAGE_VALIDATION_SCHEMA = Yup.object({
  subject: Yup.string().max(255).required(),
  message: Yup.string().max(2048).required(),
  participantSelection: Yup.string().required()
});

export const TEAM_MESSAGE_VALIDATION_SCHEMA = Yup.object({
  subject: Yup.string().max(255).required(),
  message: Yup.string().max(2048).required(),
  teamSelection: Yup.string().required(),
  hostMessagePartTemplate: Yup.string().required(),
  nonHostMessagePartTemplate: Yup.string().required(),
});

export const DINNERROUTE_MESSAGE_VALIDATION_SCHEMA = Yup.object({
  subject: Yup.string().max(255).required(),
  message: Yup.string().max(2048).required(),
  selfTemplate: Yup.string().max(2048).required(),
  hostsTemplate: Yup.string().max(2048).required(),
  teamSelection: Yup.string().required(),
});
