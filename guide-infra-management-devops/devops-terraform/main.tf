provider "aws" {
  region = "ap-northeast-1"
}

module "networking" {
  source = "./modules/networking"

  project             = var.project
  vpc_cidr            = "10.0.0.0/16"
  private_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets      = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
  elasticache_subnets = ["10.0.7.0/24", "10.0.8.0/24", "10.0.9.0/24"]
}

module "ecr" {
  source = "./modules/ecr"

  project = var.project
  service = var.service
}

module "s3" {
  source      = "./modules/s3"
  project     = var.project
  bucket_name = var.s3_bucket_response_json_default
}

module "ecs" {
  source = "./modules/ecs"

  project = var.project
  service = var.service
  vpc     = module.networking.vpc
  sg      = module.networking.sg

  account_id = var.account_id
  ecs = {
    cpu           = "512"
    memory        = "1024"
    desired_count = "1"
    env = {
      dynamo_table = var.dynamo_table
      region = var.region
      s3_bucket  = module.s3.s3_bucket.bucket
      aws_access_key_id = var.aws_access_key_id
      aws_secret_access_key = var.aws_secret_access_key
    }
  }

  alb = {
    port                = "443"
    protocol            = "HTTPS"
    tg_protocol         = "HTTP"
    healthcheck_port    = "8080"
    healthy_threshold   = "5"
    interval            = "30"
    healthcheck_status  = "200"
    healthcheck_path    = "/api/v1/s3"
    healthcheck_timeout = "5"
    unhealthy_threshold = "2"
  }

  ecr_repo_name = var.ecr_repo_name
  acm_domain    = var.acm_domain
  domain        = var.domain
}
