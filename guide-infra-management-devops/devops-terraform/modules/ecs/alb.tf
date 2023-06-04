resource "aws_lb" "alb" {
  name                       = "${var.project}-alb"
  internal                   = false
  drop_invalid_header_fields = true
  ip_address_type            = "ipv4"
  load_balancer_type         = "application"
  idle_timeout               = 60
  security_groups            = [var.sg.alb]
  subnets                    = var.vpc.public_subnets

  enable_deletion_protection = false

  access_logs {
    bucket  = aws_s3_bucket.s3_bucket.bucket
    prefix  = "${var.service}"
    enabled = true
  }

  tags = {
    Name    = "tf-${var.service}-alb"
    Project = var.project
  }
}

resource "aws_lb_target_group" "alb" {
  deregistration_delay          = "300"
  load_balancing_algorithm_type = "round_robin"
  name                          = "${var.project}-${var.service}-tg"
  port                          = var.alb.healthcheck_port
  protocol                      = var.alb.tg_protocol
  slow_start                    = "0"
  target_type                   = "ip"
  vpc_id                        = var.vpc.vpc_id

  stickiness {
    cookie_duration = "86400"
    enabled         = false
    type            = "lb_cookie"
  }

  health_check {
    enabled             = true
    healthy_threshold   = var.alb.healthy_threshold
    interval            = var.alb.interval
    matcher             = var.alb.healthcheck_status
    path                = var.alb.healthcheck_path
    port                = var.alb.healthcheck_port
    protocol            = var.alb.tg_protocol
    timeout             = var.alb.healthcheck_timeout
    unhealthy_threshold = var.alb.unhealthy_threshold
  }
}


resource "aws_lb_listener" "alb" {
  load_balancer_arn = aws_lb.alb.arn
  port              = var.alb.port
  protocol          = var.alb.protocol
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.acm.arn

  default_action {
    order            = "1"
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb.arn
  }
}