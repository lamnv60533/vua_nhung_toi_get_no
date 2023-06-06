provider "aws" {
  region = "ap-northeast-1"
}

module "ecr" {
  source = "./modules/ecr"

  project = var.project
  service = var.service
}

module "alb_sg" {
  source = "terraform-in-action/sg/aws"
  vpc_id = var.vpc.vpc_id
  name   = "${var.project}-${var.service}-alb-sg"
  ingress_rules = [
    {
      port        = 80
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      port        = 443
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

module "server_sg" {
  source = "terraform-in-action/sg/aws"
  vpc_id = var.vpc.vpc_id
  name   = "${var.project}-${var.service}-server-sg"
  ingress_rules = [
    {
      port            = 8080
      security_groups = [module.alb_sg.security_group.id]
    }
  ]
}

module "ecs" {
  source = "./modules/ecs"

  project = var.project
  service = var.service
  vpc     = var.vpc
  sg      = {
    alb    = module.alb_sg.security_group.id
    server = module.server_sg.security_group.id
  }

  account_id = var.account_id
  ecs = {
    cpu           = "512"
    memory        = "1024"
    desired_count = "1"
    env = {
      dynamo_table      = var.dynamo_table
      region            = var.region
      s3_bucket         = var.s3_bucket_dev_kcmsr_sources
      target_account_id = var.target_account_id
      target_role_name  = var.target_role_name
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
    healthcheck_path    = "/api/v1/health"
    healthcheck_timeout = "5"
    unhealthy_threshold = "2"
  }

  ecr_repo_name = var.ecr_repo_name
  acm_domain    = var.acm_domain
  domain        = var.domain
}
