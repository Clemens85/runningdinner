import {useAsync} from "react-async-hook";
import {LinearProgress} from "@material-ui/core";
import React, {ReactElement} from "react";

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

  if (error) {
    return <div>{error.message}</div>;
  }
  else if (loading) {
    return <LinearProgress color="secondary" />;
  }
  else {
    const mergedResult = { result, reFetch: () => { return asyncResult.execute(parameters); }};
    // @ts-ignore
    return props.render(mergedResult) as ReactElement<any>;
  }
}
