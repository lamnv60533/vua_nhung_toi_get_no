resource "aws_cloudwatch_log_group" "cloudwatch_log_group" {
  name              = "/ecs/logs/${var.project}-${var.service}"
  retention_in_days = 7


  tags = {
    Name = "/ecs/logs/${var.project}--${var.service}"
  }
}

