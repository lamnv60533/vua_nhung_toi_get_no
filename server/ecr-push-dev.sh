#!/bin/bash

ECR_REPO_NAME=guide-infra-management-api-ecr-repo
ECR_REPO_URL=158582744427.dkr.ecr.ap-northeast-1.amazonaws.com/$ECR_REPO_NAME
echo "Build and push to $ECR_REPO_URL"

echo "Your AWS Account:"
aws sts get-caller-identity

read -p "Please check your AWS account before push docker image! Do you want continue? [Y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then

    echo "Building..."
    date=$(date '+%Y%m%d%H%M%S')
    echo 'date:' $date
    docker build --platform linux/amd64 -t $ECR_REPO_NAME:$date . || exit 1
    echo "Start push image to ECR repository..."
    ECR_AUTH_TOKEN=$(aws ecr get-login-password --region ap-northeast-1)
    docker login -u AWS -p $ECR_AUTH_TOKEN https://$ECR_REPO_URL
    docker tag $ECR_REPO_NAME:$date $ECR_REPO_URL:latest
    docker tag $ECR_REPO_NAME:$date $ECR_REPO_URL:$date
    docker push $ECR_REPO_URL:latest
    docker push $ECR_REPO_URL:$date
    ECR_AUTH_TOKEN=""
fi