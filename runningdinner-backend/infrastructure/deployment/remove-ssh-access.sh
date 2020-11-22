#!/bin/bash
# see https://blog.cloudinvaders.com/add-your-ip-address-to-an-ec2-security-group-from-command-line/
export IP=`curl -s https://api.ipify.org`
echo $IP
aws ec2 revoke-security-group-ingress --group-id sg-03855e75fad5dd372 --protocol tcp --port 22 --cidr $IP/32 --region eu-central-1
