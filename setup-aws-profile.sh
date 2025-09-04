#!/bin/bash

# Create AWS credentials directory if it doesn't exist
mkdir -p ~/.aws

# Configure the 'abc' profile
aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID" --profile abc
aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY" --profile abc
aws configure set aws_session_token "$AWS_SESSION_TOKEN" --profile abc
aws configure set region "$AWS_DEFAULT_REGION" --profile abc

echo "AWS profile 'abc' configured successfully"
