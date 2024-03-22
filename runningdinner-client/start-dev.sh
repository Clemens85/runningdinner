#!/bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1

VALUE=$(aws ssm --endpoint-url "http://127.0.0.1:4566" get-parameter --with-decryption --name "/runningdinner/googlemaps/apikey" --query "Parameter.Value" --output text)
export VITE_GOOGLE_MAPS_KEY_JS="$VALUE"
cd webapp && pnpm dev