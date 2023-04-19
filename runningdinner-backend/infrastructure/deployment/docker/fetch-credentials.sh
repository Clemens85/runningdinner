#! /bin/bash

rm -f ./aws.env

echo "SPRING_DATASOURCE_PASSWORD=$(aws ssm get-parameters --names SPRING_DATASOURCE_PASSWORD --with-decryption --query 'Parameters[0].Value' --output text)" >> ./aws.env
echo "SPRING_DATASOURCE_USERNAME=$(aws ssm get-parameters --names SPRING_DATASOURCE_USERNAME --with-decryption --query 'Parameters[0].Value' --output text)" >> ./aws.env
# ...