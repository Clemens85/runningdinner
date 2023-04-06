#!/bin/bash
docker exec -it $(docker ps | grep localstack_main | awk '{print $1}') /bin/bash