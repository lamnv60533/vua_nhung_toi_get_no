variable "account_id" {
  type    = string
}

variable "region" {
  type = string
}

variable "project" {
  type = string
}

variable "service" {
  type = string
}

variable "ecr_repo_name" {
  type = string
}

variable "acm_domain" {
  type = string
}

variable "domain" {
  type = string
}

variable "dynamo_table" {
  type = string
}

variable "vpc" {
}

variable "s3_bucket_dev_kcmsr_sources" {
  type = string
}

variable "target_account_id" {
  type = string
}

variable "target_role_name" {
  type = string
}