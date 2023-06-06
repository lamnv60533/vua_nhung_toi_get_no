# variables
account_id    = "158582744427"
region        = "ap-northeast-1"
project       = "guide-infra-management"
service       = "api"
ecr_repo_name = "guide-infra-management-api-ecr-repo"
acm_domain    = "api"
domain        = "management.guide.inc"
dynamo_table  = "guide-infra-environment-table"
vpc           = {
  vpc_id           = "vpc-0c5e75db3c983e4f4"
  public_subnets   = ["subnet-05b863cffe7745a3c", "subnet-04f49038d811bb714", "subnet-02dfc32c8ca7819c6"]
  private_subnets = ["subnet-0de253c956a127ab7", "subnet-09dcda01e5b0e6b5b", "subnet-06be2ea04f6d855c6"]
}
s3_bucket_dev_kcmsr_sources = "dev-kcmsr-sources"
target_account_id = "613546001725"
target_role_name = "cross-account-universal-service-guide-access-role"