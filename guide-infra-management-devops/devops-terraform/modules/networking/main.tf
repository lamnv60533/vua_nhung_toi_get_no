data "aws_availability_zones" "available" {}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "${var.project}-vpc"
  cidr = var.vpc_cidr
  azs  = data.aws_availability_zones.available.names

  enable_dns_support   = true
  enable_dns_hostnames = true

  private_subnets     = var.private_subnets
  public_subnets      = var.public_subnets
  elasticache_subnets = var.elasticache_subnets

  create_elasticache_subnet_group = true
  enable_nat_gateway              = false
}

module "endpoints" {
  source = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"

  vpc_id             = module.vpc.vpc_id
  security_group_ids = [data.aws_security_group.default.id]

  endpoints = {
    s3 = {
      service         = "s3"
      service_type    = "Gateway"
      route_table_ids = module.vpc.private_route_table_ids
      tags            = { Name = "s3-vpc-endpoint" }
    }

    logs = {
      service             = "logs"
      private_dns_enabled = true
      subnet_ids          = [module.vpc.private_subnets[0]]
      security_group_ids  = [module.vpce_sg.security_group.id]
      tags                = { Name = "logs-vpc-endpoint" }
    }

    ecr-dkr = {
      service             = "ecr.dkr"
      private_dns_enabled = true
      subnet_ids          = [module.vpc.private_subnets[0]]
      security_group_ids  = [module.vpce_sg.security_group.id]
      tags                = { Name = "ecr-dkr-vpc-endpoint" }
    }

    ecr-api = {
      service             = "ecr.api"
      private_dns_enabled = true
      subnet_ids          = [module.vpc.private_subnets[0]]
      security_group_ids  = [module.vpce_sg.security_group.id]
      tags                = { Name = "ecr-api-vpc-endpoint" }
    }
  }
}

module "alb_sg" {
  source = "terraform-in-action/sg/aws"
  vpc_id = module.vpc.vpc_id
  name   = "${var.project}-alb-sg"
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
  vpc_id = module.vpc.vpc_id
  name   = "${var.project}-server-sg"
  ingress_rules = [
    {
      port            = 8080
      security_groups = [module.alb_sg.security_group.id]
    }
  ]
}

module "vpce_sg" {
  source = "terraform-in-action/sg/aws"
  vpc_id = module.vpc.vpc_id
  name   = "${var.project}-vpce-sg"
  ingress_rules = [
    {
      port            = 443
      security_groups = [module.server_sg.security_group.id]
    }
  ]
}

########################
# Supporting Resources
########################
data "aws_security_group" "default" {
  name   = "default"
  vpc_id = module.vpc.vpc_id
}
