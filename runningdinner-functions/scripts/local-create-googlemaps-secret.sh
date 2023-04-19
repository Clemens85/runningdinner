#! /bin/bash

VALUE=$1

aws ssm --endpoint-url http://127.0.0.1:4566 put-parameter \
    --name "/runningdinner/googlemaps/apikey" \
    --value "$VALUE" \
    --type "SecureString"