#!/bin/bash
aws sqs purge-queue --endpoint-url http://localhost:4566 --queue-url "http://localhost:4566/000000000000/geocode"