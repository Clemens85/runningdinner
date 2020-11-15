'use strict';

const controller = require('./controller');

module.exports.update = async event => {

  let pathParameters = event.pathParameters;
  const { adminId } = pathParameters;
  const { participantId } = pathParameters;

  let result = await controller.updateGeocodingInformation(adminId, participantId);

  return {
    statusCode: 200,
    body: JSON.stringify(
      result, null, 2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
