resource "aws_acm_certificate" "acm" {
  domain_name       = "${var.acm_domain}.${var.domain}"
  validation_method = "DNS"
}

resource "aws_route53_record" "route53_record" {
  for_each = {
    for dvo in aws_acm_certificate.acm.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 300
  type            = each.value.type
  zone_id         = data.aws_route53_zone.route53_zone.id
}

data "aws_route53_zone" "route53_zone" {
  name = "${var.domain}"
}
