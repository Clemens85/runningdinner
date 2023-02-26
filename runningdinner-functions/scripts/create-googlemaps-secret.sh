#! /bin/bash

VALUE=$1

aws ssm put-parameter \
    --name "runningdinner/googlemaps/apikey" \
    --value "$VALUE" \
    --type "SecureString"