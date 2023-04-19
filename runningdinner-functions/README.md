# Overview

Contains a quite simple lambda for geocoding addresses, that is invoked by SQS events which are sent from backend application.

## Prerequisites

* SQS needs to be setup in front
* SSM (Parameter Store) is used to get hold of the Google Maps API Key and must be setup in front

## Run locally

``./start-local.sh``

* Serverless offline plugin is used for being able to run the lambda locally
* It provides also a local SQS queue which is backed by Localstack
* The parameter store (SSM) is also provided by Localstack 

See the scripts in runningdinner-infrastructure/local for more information. There is also a convenience script for adding a
Google Maps Key to the local SSM Parameter Store.

## Running the Tests

The test is quite a full integration test for performing a real geocoding operation.
It needs therefore a Google Maps Key provided by Localstack.<br/>
Furthermore we need to overwrite the SSM parameter store endpoint to Localstack by setting the env-var:
`AWS_ENDPOINT_URL_OVERWRITE = http://localhost:4566`

## Esbuild
For minifying the packaged Javascript code the esbuild-plugin is used which seems to work also with the latest Nodejs 18x version.

## Deploy

We have 2 stages to deploy to: dev and prod

``./deploy-dev.sh``

---


## Helpful Links

https://github.com/softwaremill/elasticmq

https://github.com/AnomalyInnovations/serverless-bundle
https://github.com/FidelLimited/serverless-plugin-warmup

https://serverless.com/blog/structuring-a-real-world-serverless-app/
https://serverless.com/blog/serverless-deployment-best-practices/

https://serverless.com/blog/setup-monitoring-for-existing-serverless-projects-in-2min/

https://serverless.com/blog/serverless-microservice/

https://serverless.com/blog/common-node8-mistakes-in-lambda/

https://serverless.com/blog/unit-testing-nodejs-serverless-jest/

https://serverless.com/blog/aws-lambda-sqs-serverless-integration/

https://serverless.com/framework/docs/providers/aws/events/apigateway/

https://serverless-stack.com/#table-of-contents
https://serverless-stack.com/chapters/organizing-serverless-projects.html
https://serverless-stack.com/chapters/add-a-create-note-api.html
https://serverless-stack.com/chapters/unit-tests-in-serverless.html
https://serverless-stack.com/chapters/debugging-serverless-api-issues.html
