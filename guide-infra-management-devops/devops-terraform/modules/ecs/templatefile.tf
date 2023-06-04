data "template_file" "ecs_container_definition" {
  template = file("${path.module}/container_definition.json")

  vars = {
    project       = var.project
    service       = var.service
    region        = var.ecs.env.region
    account_id    = var.account_id
    ecr_repo_name = var.ecr_repo_name
    s3_bucket     = var.ecs.env.s3_bucket
    dynamo_table  = var.ecs.env.dynamo_table
    aws_access_key_id = var.ecs.env.aws_access_key_id
    aws_secret_access_key = var.ecs.env.aws_secret_access_key
  }
}
