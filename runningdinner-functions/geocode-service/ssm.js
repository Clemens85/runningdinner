const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

const getSsmParameterCached = (params, cacheTime) => {
  let lastRefreshed = undefined;
  let lastResult = undefined;
  let queue = Promise.resolve();
  return () => {
    // serialize async calls
    const res = queue.then(async () => {
      const currentTime = new Date().getTime();
      // check if cache is fresh enough
      if (lastResult === undefined ||
        lastRefreshed + cacheTime < currentTime) {
        // refresh the value
        lastResult = await ssm.getParameter(params).promise();
        lastRefreshed = currentTime;
      }
      return lastResult;
    });
    queue = res.catch(() => {});
    return res;
  };
};

module.exports = {
  getSsmParameterCached
};
