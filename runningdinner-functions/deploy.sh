#! /bin/bash

set +e
CUR_DIR=$(pwd)

passedStage=$1
if [[ -z "$passedStage" ]]; then
  echo "Error: Must pass a stage as first parameter"
  exit 1
fi

cd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1

source ../../runningdinner-infrastructure/aws/scripts/setup-aws-cli.sh $passedStage

npx sls deploy --stage $passedStage --verbose

source ../../runningdinner-infrastructure/aws/scripts/clear-aws-cli.sh

cd $CUR_DIR