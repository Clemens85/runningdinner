## Overview

Contains a quite simple lambda for geocoding addresses, that is invoked by SQS events which are sent from backend application.

## Run locally

``serverless offline start --stage dev``

This mocks a local SQS.

## Deploy

``serverless decrypt --stage prod --password 'MY_PASSWORD' ``

``serverless deploy --stage prod``

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
