
const awsRegion = process.env.AWS_REGION || "eu-central-1";
const awsEndpointUrlOverwrite = process.env.AWS_ENDPOINT_URL_OVERWRITE;

function getAwsBaseParams() {
  const result = {
    region: awsRegion
  }
  if (awsEndpointUrlOverwrite && awsEndpointUrlOverwrite.length > 0) {
    result.endpoint = awsEndpointUrlOverwrite;
  }
  return result;
}

module.exports = {
  getAwsBaseParams
};