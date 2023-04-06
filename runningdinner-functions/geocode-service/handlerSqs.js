'use strict';

const controller = require('./controller');
const lodash = require('lodash');
const {getAwsBaseParams} = require('./baseAwsParams');

console.info(`Starting with aws params ${JSON.stringify(getAwsBaseParams())}`);

module.exports.update = async event => {

  console.info("Processing SQS event: " + JSON.stringify(event));

  let asyncJobs = [];

  let records = event.Records || [];
  for (let i = 0; i < records.length; i++) {
    asyncJobs.push(processSqsRecord(records[i]));
  }

  for (let j = 0; j < asyncJobs.length; j++) {
    await asyncJobs[j];
  }
};

function processSqsRecord(record) {
  const adminId = lodash.get(record, "messageAttributes.adminId.stringValue");
  const body = getMessageBodyParsed(record);

  if (isRequestForAfterPartyLocation(body)) {
    return controller.updateGeocodingInformationForAfterPartyLocation(adminId, body);
  }

  const participantId = lodash.get(record, "messageAttributes.participantId.stringValue");
  return controller.updateGeocodingInformation(adminId, participantId);
}

function isRequestForAfterPartyLocation(body) {
  return body && body.runningDinnerType && body.runningDinnerType.length > 0;
}

function getMessageBodyParsed(record) {
  const messageBody = lodash.get(record, "body");
  const result = messageBody && messageBody.length > 0 ? JSON.parse(messageBody) : undefined;
  return result;
}
