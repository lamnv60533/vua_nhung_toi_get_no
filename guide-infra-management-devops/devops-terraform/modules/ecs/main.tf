## ecs cluster
resource "aws_ecs_cluster" "ecs_cluster" {
  name = "${var.project}-${var.service}-ecs-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

## ecs task 
resource "aws_ecs_task_definition" "ecs_task_definition" {
  family                   = "${var.project}-${var.service}-ecs-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.ecs.cpu
  memory                   = var.ecs.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  container_definitions    = data.template_file.ecs_container_definition.rendered

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  tags = {
    Name = "${var.project}-${var.service}-ecs-task"
  }
}

## ecs service
resource "aws_ecs_service" "ecs_service" {
  name                    = "${var.project}-${var.service}-ecs-service"
  cluster                 = aws_ecs_cluster.ecs_cluster.id
  task_definition         = aws_ecs_task_definition.ecs_task_definition.arn
  launch_type             = "FARGATE"
  platform_version        = "LATEST"
  enable_execute_command  = false
  enable_ecs_managed_tags = true
  desired_count           = var.ecs.desired_count

  deployment_circuit_breaker {
    enable   = false
    rollback = false
  }

  deployment_controller {
    type = "ECS"
  }

  network_configuration {
    assign_public_ip = false
    security_groups  = [var.sg.server]
    subnets          = [var.vpc.private_subnets[0]]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb.arn
    container_name   = "${var.project}-${var.service}-ecs-container"
    container_port   = var.alb.healthcheck_port
  }

  tags = {
    Name = "${var.project}-${var.service}-ecs-service"
  }

  depends_on = [
    aws_lb_target_group.alb
  ]
}

