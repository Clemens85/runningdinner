#! /bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1

source ../../runningdinner-infrastructure/aws/scripts/setup-aws-cli.sh dev

npx sls deploy --stage dev

source ../../runningdinner-infrastructure/aws/scripts/clear-aws-cli.sh