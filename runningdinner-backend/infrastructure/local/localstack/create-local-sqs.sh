#!/bin/bash
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name geocode --region eu-central-1

# https://www.bitovi.com/blog/running-aws-resources-on-localstack#:~:text=Setting%20Up%20LocalStack,and%20set%20the%20environmental%20variables.&text=In%20SERVICES%20%2C%20you%20declare%20which,iam%2C%20s3%2C%20and%20lambda.

# aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket geocode-service-prod-serverlessdeploymentbucket-1m9l8yhnx68z2 --create-bucket-configuration LocationConstraint=eu-central-1