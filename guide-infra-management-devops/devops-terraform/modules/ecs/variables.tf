variable "project" {
    type = string
}
variable "service" {
    type = string
}
variable "account_id" {
    type = string
}

variable "vpc" {
  type = any
}

variable "sg" {
  type = any
}

# ECS Specification
variable "ecs" {
    type = any
}

# ALB Specification
variable "alb" {
    type = any
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
