# diagram.py
import diagrams
from diagrams.aws.compute import ECS, ECR
from diagrams.aws.database import DDB
from diagrams.aws.network import ALB, CF, APIGateway
from diagrams.aws.security import WAF
from diagrams.onprem.vcs import Github
from diagrams.aws.storage import S3
from diagrams.programming.framework import Flutter
from diagrams.aws.management import Cloudwatch
from diagrams.aws.devtools import Codepipeline,Codebuild
from diagrams.aws.compute import Lambda
from diagrams.custom import Custom
from urllib.request import urlretrieve

with diagrams.Diagram("Guide Infrastructure Management App", show=False):  
    # download the icon image file
    diagrams_url = "https://www.marcus-povey.co.uk/wp-content/avatar.png"
    diagrams_icon = "avatar.png"
    urlretrieve(diagrams_url, diagrams_icon)

    backlog_url = "https://www.opentone.co.jp/backlog/wp-content/uploads/sites/5/2020/06/backlog-logo.png"
    backlog_icon = "backlog.png"
    urlretrieve(backlog_url, backlog_icon)

    backlog = keycloak = Custom("",backlog_icon)
    github = Github("github") 
    flutter = Flutter()

    with diagrams.Cluster("AWS Cloud"):
       
        with diagrams.Cluster("KCMSR-Project"):
            gateway = APIGateway("AWS Gateway")
            ld = Lambda("lambda")
            s3 = S3("S3")
            kcmnsrECR = ECR("ECR")
        
            with diagrams.Cluster("KCMSR-VPC"):
                
                kcmsrCodepipeline = Codepipeline("Code Pipeline")
                kcmsrCodebuild = Codebuild("Code build") 
                backlog >> gateway >> ld >> s3 >> kcmsrCodepipeline >> kcmsrCodebuild >> kcmnsrECR

        with diagrams.Cluster("Guide Universal Project"):
            waf =  WAF("AWS WAF")
            ddb =  DDB("dynamoDB")
            alb =  ALB("ALB")
            with diagrams.Cluster("KCMSR-VPC"):
                with diagrams.Cluster("private subnet"):
                    keycloak = Custom("",diagrams_icon)
                    ec2 = ECS("ECS",)
                    ec2 << diagrams.Edge(ltail="cluster_tgw", lhead='cluster_1a', minlen="2") >> keycloak 
                    alb >> ec2 >> ddb
                    ec2 >> kcmsrCodepipeline
    
            with diagrams.Cluster("Frontend"):
                cf = CF("CloudFront")
                waf >> cf << S3("S3")
                cf << diagrams.Edge(ltail="cluster_tgw", lhead='cluster_1a', minlen="2") >> keycloak
                cf >> ec2
            flutter >> waf >> alb
            ec2 >> Cloudwatch("CloudWatch")

            with diagrams.Cluster("CI/CD"):
                github >> Codepipeline("Code Pipeline") >> Codebuild("Code build") >> ECR("ECR") \
                    >> diagrams.Edge() >> ec2