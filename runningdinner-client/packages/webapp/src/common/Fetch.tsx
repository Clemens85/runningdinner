import {useAsync} from "react-async-hook";
import React, {ReactElement} from "react";
import {ProgressBar} from "./ProgressBar";
import {getAsHttpErrorOrDefault} from "@runningdinner/shared";
import {GENERIC_HTTP_ERROR} from "@runningdinner/shared/src/redux";

export interface RenderArg<T> {
  reFetch: () => Promise<T>;
  result: T;
}

export interface FetchProps<T> {
  asyncFunction: (...args: any[]) => Promise<T>;
  parameters: any;
  render: (result: RenderArg<T>) => unknown;
}

export function Fetch<T>(props: FetchProps<T>) {

  const { asyncFunction, parameters} = props;

  const asyncResult = useAsync<T>(asyncFunction, parameters);
  const { loading, result, error } = asyncResult;

  if (loading || error) {
    const httpFetchError = error ? getAsHttpErrorOrDefault(error, GENERIC_HTTP_ERROR) : undefined;
    return <ProgressBar showLoadingProgress={loading} fetchError={httpFetchError} />;
  } else {
    const mergedResult = { result, reFetch: () => { return asyncResult.execute(parameters); }};
    // @ts-ignore
    return props.render(mergedResult) as ReactElement<any>;
  }
}
