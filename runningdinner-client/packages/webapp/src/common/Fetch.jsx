import {useAsync} from "react-async-hook";
import {LinearProgress} from "@material-ui/core";
import React from "react";

const Fetch = (props) => {

  const { asyncFunction, parameters} = props;

  const asyncResult = useAsync(asyncFunction, parameters);
  const { loading, result, error } = asyncResult;

  if (error) { return <div>{error.message}</div>; }
  if (loading) { return <LinearProgress color="secondary" />; }

  const mergedResult = { result, reFetch: () => { return asyncResult.execute(parameters); }};
  return props.render(mergedResult);
};

export default Fetch;
