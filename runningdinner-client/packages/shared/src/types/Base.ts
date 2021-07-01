import { ReactNode } from "react";
import { RunningDinner } from "./RunningDinner";

export interface BaseEntity {
  id?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export enum FuzzyBoolean {
  TRUE = "TRUE",
  FALSE = "FALSE",
  UNKNOWN = "UNKNOWN"
}

export interface RunningDinnerRelated extends BaseEntity {
  runningDinnerId: string;
  adminId: string;
}

export interface LabelValue {
  label: string;
  value: string;
  description?: string;
}

export enum GenderAspects {
  FORCE_GENDER_MIX = "FORCE_GENDER_MIX",
  FORCE_SAME_GENDER = "FORCE_SAME_GENDER",
  IGNORE_GENDE0R = "IGNORE_GENDE0R"
}

export enum RelatedEntityType {
  MESSAGE_JOB = "MESSAGE_JOB",
  PARTICIPANT = "PARTICIPANT"
}

export type CallbackHandler = (...args: any[]) => unknown;

export type CallbackHandlerAsync = (...args: any[]) => Promise<unknown>;

export const NoopFunction = () => {};

export interface ClickableTextEntry {
  /**
   * A label to be displayed
   */
  label: string;
  /**
   * Action that is executed when entry is clicked
   */
  onClick: CallbackHandler;
}

export interface ClickableTextIconEntry extends ClickableTextEntry {
  /**
   * Optional icon that is placed left of the label
   */
  icon?: ReactNode;
}

export interface Parent {
  children?: React.ReactNode;
}

export interface BaseRunningDinnerProps {
  runningDinner: RunningDinner;
}

export interface BaseAdminIdProps {
  adminId: string;
}