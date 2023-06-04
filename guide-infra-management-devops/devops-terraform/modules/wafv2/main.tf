resource "aws_wafv2_ip_set" "wafv2_guide_ipset" {
  name               = "guide-proxy"
  description        = "guide-proxy"
  scope              = "REGIONAL"
  ip_address_version = "IPV4"
  addresses          = var.guide_ipset
}

resource "aws_wafv2_web_acl" "wafv2_web_acl" {
  name        = "${var.project}-waf-for-alb"
  description = "${var.project}-waf-for-alb"
  scope       = "REGIONAL"

  default_action {
    block {}
  }

  # rule {
  #   name     = "AWS-AWSManagedRulesAmazonIpReputationList"
  #   priority = 0

  #   override_action {
  #     none {}
  #   }

  #   statement {
  #     managed_rule_group_statement {
  #       name        = "AWSManagedRulesAmazonIpReputationList"
  #       vendor_name = "AWS"

  #       excluded_rule {
  #         name = "SizeRestrictions_QUERYSTRING"
  #       }
  #     }
  #   }

  #   visibility_config {
  #     cloudwatch_metrics_enabled = true
  #     metric_name                = "AWS-AWSManagedRulesCommonRuleSet"
  #     sampled_requests_enabled   = true
  #   }
  # }

  # rule {
  #   name     = "AWS-AWSManagedRulesCommonRuleSet"
  #   priority = 1

  #   override_action {
  #     none {}
  #   }

  #   statement {
  #     managed_rule_group_statement {
  #       name        = "AWSManagedRulesCommonRuleSet"
  #       vendor_name = "AWS"

  #       excluded_rule {
  #         name = "NoUserAgent_HEADER"
  #       }

  #       excluded_rule {
  #         name = "SizeRestrictions_QUERYSTRING"
  #       }
  #     }
  #   }

  #   visibility_config {
  #     cloudwatch_metrics_enabled = true
  #     metric_name                = "AWS-AWSManagedRulesCommonRuleSet"
  #     sampled_requests_enabled   = true
  #   }
  # }

  # rule {
  #   name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
  #   priority = 2

  #   override_action {
  #     none {}
  #   }

  #   statement {
  #     managed_rule_group_statement {
  #       name        = "AWSManagedRulesKnownBadInputsRuleSet"
  #       vendor_name = "AWS"
  #     }
  #   }

  #   visibility_config {
  #     cloudwatch_metrics_enabled = true
  #     metric_name                = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
  #     sampled_requests_enabled   = true
  #   }
  # }

  rule {
    name     = "rule-for-guide-ipset"
    priority = 0
    action {
      allow {}
    }

    statement {
      ip_set_reference_statement {
        arn = aws_wafv2_ip_set.wafv2_guide_ipset.arn
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "rule-for-guide-ipset"
      sampled_requests_enabled   = true
    }
  }
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project}-waf-for-alb"
    sampled_requests_enabled   = true
  }
}

resource "aws_wafv2_web_acl_association" "wafv2" {
  resource_arn = var.alb.arn
  web_acl_arn  = aws_wafv2_web_acl.wafv2_web_acl.arn
}