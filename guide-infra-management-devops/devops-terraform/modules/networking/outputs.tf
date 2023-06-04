output "vpc" {
  value = module.vpc
}

output "sg" {
  value = {
    alb = module.alb_sg.security_group.id
    server = module.server_sg.security_group.id
  }
}
