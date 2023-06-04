output "ecr" {
  value = {
    repository_url = aws_ecr_repository.ecr.repository_url
  }
}
