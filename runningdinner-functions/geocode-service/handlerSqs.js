'use strict';

const controller = require('./controller');
const lodash = require('lodash');

module.exports.update = async event => {

  console.info("Processing SQS event: " + event);

  let asyncJobs = [];

  let records = event.Records || [];
  for (var i = 0; i < records.length; i++) {
    asyncJobs.push(processSqsRecord(records[i]));
  }

  for (var j = 0; j < asyncJobs.length; j++) {
    await asyncJobs[j];
  }
};

function processSqsRecord(record) {
  console.info("Processing record: " + record);
  let adminId = lodash.get(record, "messageAttributes.adminId.stringValue");
  let participantId = lodash.get(record, "messageAttributes.participantId.stringValue");
  console.info("Retrieved participantId: " + participantId);
  return controller.updateGeocodingInformation(adminId, participantId);
}
