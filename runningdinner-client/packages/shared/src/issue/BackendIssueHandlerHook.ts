import {
  getBackendIssuesFromErrorResponse,
  mapBackendIssuesToIssues,
} from "./BackendIssueHandler";
import { useTranslation } from "react-i18next";
import cloneDeep from "lodash/cloneDeep";
import { isStringNotEmpty } from "../Utils";
import {HttpError, Issue, IssueOption, Issues} from "../types";

export const COMMON_ERROR_NAMESPACE = "common";

export interface BackendIssueHandlerMethods {
  /**
   * Extracts (backend) issues from an erroneous http response
   *
   * @param httpError
   */
  getIssuesUntranslated: (httpError: HttpError) => Issues;

  /**
   * Extracts (backend) issues from an erroneous http response and tries to translate each single issue into a human readable text.<br/>
   * See {@link BackendIssueHandlerProps} for how to control translation process.
   * @param httpError
   */
  getIssuesTranslated: (httpError: HttpError) => Issues;

  /**
   * Convenience method which can be used in forms for showing validation errors. <br />
   * This method extracts all issues from an validation error response and convert them into translated {@link Issue} objects and
   * connect them to the underlying form by using the provided setSingleFormErrorIntoFormCallback callback function.
   *
   * @param httpError
   * @param setSingleFormErrorIntoFormCallback
   * @return {@link ApplicationErrors} which contains all found ApplicationErrors, which might be further interesting for the caller
   */
  applyValidationIssuesToForm: (httpError: HttpError, setSingleFormErrorIntoFormCallback: (fieldName: any, error: IssueOption) => unknown) => Issues;
}

/**
 * Controls how {@link useBackendIssueHandler} deals with backend issues. <br/>
 * You can e.g. pass one or more translation namespaces of your app that are automatically searched for matching translation keys.<br/>
 * If you need more control, you can also pass a custom translation function which gives you full control about how to translate an {@link Issue}
 */
export interface BackendIssueHandlerProps {
  /**
   * Provides convenient functionality for automatically translating an issue's i18nkey into human readable text. <br/>
   * Can be customized by providing some specific attributes inside the settings. If no object is passed, then the default settings are applied.
   */
  defaultTranslationResolutionSettings?: DefaultTranslationResolutionStrategySettings;

}

enum NameResolutionStrategy {
  UPPERCASE = "UPPERCASE",
  LOWERCASE = "LOWERCASE",
  NONE = "NONE",
}

/**
 * Controls the default translation resolution settings when dealing with backend errors
 */
export interface DefaultTranslationResolutionStrategySettings {
  /**
   * If set to true, the common translation namespace is automatically included when searching for translations, which provides some common error translations. <br/>
   * Defaults to true if not specified
   */
  includeCommonNamespace?: boolean;

  /**
   * One or more of your application namespaces which should be searched for error translations. Can be empty if you don't have custom error translations
   */
  namespaces?: string | string[];

  /**
   * Specify how the backend i18nkeys should be tried to match your client translations. Can be empty for default settings (order: uppercase, lowercase, no-conversion)
   */
  nameResolutionStrategyOrder?: NameResolutionStrategy[];

  /**
   * Specify a fallback translation if your backend error could not be resolved (if no fallback is provided, then your i18nkey from backend will just be returned)
   */
  fallbackTranslation?: string;
}

const DEFAULT_NAME_RESOLUTION_STRATEGY_ORDER = [
  NameResolutionStrategy.UPPERCASE,
  NameResolutionStrategy.NONE,
  NameResolutionStrategy.LOWERCASE,
];
const DEFAULT_TRANSLATION_RESOLUTION_STRATEGY_SETTINGS: DefaultTranslationResolutionStrategySettings = {
  includeCommonNamespace: true,
  nameResolutionStrategyOrder: DEFAULT_NAME_RESOLUTION_STRATEGY_ORDER,
  namespaces: [],
};

/**
 * @param props
 */
export function useBackendIssueHandler(
    props?: BackendIssueHandlerProps
): BackendIssueHandlerMethods {
  const defaultTranslationResolutionStrategy = cloneDeep(
      DEFAULT_TRANSLATION_RESOLUTION_STRATEGY_SETTINGS
  );
  if (props?.defaultTranslationResolutionSettings) {
    if (
        props.defaultTranslationResolutionSettings
            .includeCommonNamespace === false
    ) {
      defaultTranslationResolutionStrategy.includeCommonNamespace = false;
    }
    defaultTranslationResolutionStrategy.namespaces = props
        .defaultTranslationResolutionSettings.namespaces
        ? props.defaultTranslationResolutionSettings.namespaces
        : defaultTranslationResolutionStrategy.namespaces;
    defaultTranslationResolutionStrategy.nameResolutionStrategyOrder = props
        .defaultTranslationResolutionSettings.nameResolutionStrategyOrder
        ? props.defaultTranslationResolutionSettings.nameResolutionStrategyOrder
        : DEFAULT_NAME_RESOLUTION_STRATEGY_ORDER;
  }

  if (
      defaultTranslationResolutionStrategy.includeCommonNamespace
  ) {
    if (Array.isArray(defaultTranslationResolutionStrategy.namespaces)) {
      defaultTranslationResolutionStrategy.namespaces.push(
          COMMON_ERROR_NAMESPACE
      );
    } else if (
        isStringNotEmpty(defaultTranslationResolutionStrategy.namespaces)
    ) {
      defaultTranslationResolutionStrategy.namespaces = [
        defaultTranslationResolutionStrategy.namespaces,
      ];
      defaultTranslationResolutionStrategy.namespaces.push(
          COMMON_ERROR_NAMESPACE
      );
    }
  }

  const { t } = useTranslation(defaultTranslationResolutionStrategy.namespaces);

  function getIssuesUntranslated(httpError: HttpError, filterValidationErrorResponseOnly: boolean = true): Issues {
    const backendIssues = getBackendIssuesFromErrorResponse(httpError, filterValidationErrorResponseOnly);
    return mapBackendIssuesToIssues(backendIssues);
  }

  function getIssuesTranslated(httpError: HttpError, filterValidationErrorResponseOnly: boolean = true): Issues {

    const issuesRaw = getIssuesUntranslated(httpError, filterValidationErrorResponseOnly);

    const issuesFieldRelated = issuesRaw.issuesFieldRelated.map((issue) =>
        getDefaultApplicationErrorTranslation(issue)
    );
    const issuesWithoutField = issuesRaw.issuesWithoutField.map(
        (issue) => getDefaultApplicationErrorTranslation(issue)
    );
    return {
      issuesFieldRelated,
      issuesWithoutField,
    };
  }

  function applyValidationIssuesToForm(httpError: HttpError, setSingleFormErrorIntoFormCallback: (fieldName: any, error: IssueOption) => unknown): Issues {
    const {issuesFieldRelated, issuesWithoutField} = getIssuesTranslated(httpError, true);

    issuesFieldRelated.forEach((issue) =>
        setSingleFormErrorIntoFormCallback(issue.field, issue.error)
    );
    return {
      issuesFieldRelated,
      issuesWithoutField,
    };
  }

  function getDefaultApplicationErrorTranslation(
      issue: Issue
  ): Issue {
    const result = cloneDeep(issue);

    const namespaces = Array.isArray(
        defaultTranslationResolutionStrategy.namespaces
    )
        ? defaultTranslationResolutionStrategy.namespaces
        : [defaultTranslationResolutionStrategy.namespaces];

    const fallbackTranslation =
        defaultTranslationResolutionStrategy.fallbackTranslation;
    let nameResolutionStrategyOrder =
        defaultTranslationResolutionStrategy.nameResolutionStrategyOrder ||
        DEFAULT_NAME_RESOLUTION_STRATEGY_ORDER;

    for (let i = 0; i < namespaces.length; i++) {
      const namespace = namespaces[i];
      const translationResult = tryTranslation(
          issue,
          nameResolutionStrategyOrder,
          namespace
      );
      if (isStringNotEmpty(translationResult)) {
        result.error.message = translationResult;
        return result;
      }
    }

    if (isStringNotEmpty(fallbackTranslation)) {
      result.error.message = fallbackTranslation;
    }
    return result;
  }

  function tryTranslation(
      issue: Issue,
      nameResolutionStrategyOrder: NameResolutionStrategy[],
      namespace?: string
  ): string | undefined {

    if (isStringNotEmpty(namespace)) {
      for (let i = 0; i < nameResolutionStrategyOrder.length; i++) {
        const nameResolutionStrategy = nameResolutionStrategyOrder[i];
        let i18nKey = issue.error.message;
        if (nameResolutionStrategy === NameResolutionStrategy.UPPERCASE) {
          i18nKey = i18nKey.toUpperCase();
        } else if (
            nameResolutionStrategy === NameResolutionStrategy.LOWERCASE
        ) {
          i18nKey = i18nKey.toLowerCase();
        }
        const translatedMessage = t(`${namespace}:${i18nKey}`, "");
        if (isStringNotEmpty(translatedMessage)) {
          return translatedMessage;
        }
      }
    }
    return undefined;
  }

  return {
    getIssuesUntranslated,
    getIssuesTranslated,
    applyValidationIssuesToForm,
  };
}
