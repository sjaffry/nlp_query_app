import json
import boto3
import base64
import os
from botocore.exceptions import ClientError

def decode_base64_url(data):
    """Add padding to the input and decode base64 url"""
    missing_padding = len(data) % 4
    if missing_padding:
        data += '=' * (4 - missing_padding)
    return base64.urlsafe_b64decode(data)

def decode_jwt(token):
    """Split the token and decode each part"""
    parts = token.split('.')
    if len(parts) != 3:  # a valid JWT has 3 parts
        raise ValueError('Token is not valid')

    header = decode_base64_url(parts[0])
    payload = decode_base64_url(parts[1])
    signature = decode_base64_url(parts[2])

    return json.loads(payload)
    
def get_dashboard_id(business_name):
    # Implement DynamoDB retrieval
    
    # stub
    return 'ab586d4a-4fc7-46a9-8055-143e20425b5f'
    
def getEmbeddingURL(accountId, dashboardId, userArn, allowedDomains, roleArn, sessionName, stsClient):
    try:
        assumedRole = stsClient.assume_role(
            RoleArn = roleArn,
            RoleSessionName = sessionName
        )
    except ClientError as e:
        return "Error assuming role: " + str(e)
    else: 
        assumedRoleSession = boto3.Session(
            aws_access_key_id = assumedRole['Credentials']['AccessKeyId'],
            aws_secret_access_key = assumedRole['Credentials']['SecretAccessKey'],
            aws_session_token = assumedRole['Credentials']['SessionToken'],
        )
        try:
            quickSightClient = assumedRoleSession.client('quicksight', region_name='us-east-1')

            response = quickSightClient.generate_embed_url_for_registered_user(
                AwsAccountId = accountId,
                ExperienceConfiguration = {
                    "Dashboard": {
                        "InitialDashboardId": dashboardId
                    }
                },
                UserArn = userArn,
                AllowedDomains = allowedDomains,
                SessionLifetimeInMinutes = 600
            )

            return response
            
        except ClientError as e:
            return "Error generating embedding url: " + str(e)

def lambda_handler(event, context):
    
    # Let's extract the business name from the token by looking at the group memebership of the user
    token = token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - (business rule)
    business_name = decoded['cognito:groups'][0]
    user_email = decoded['email']
    if user_email is None or business_name is None:
        ValueError(f'Nulls found: business_name={business_name}, user_email={user_email}')
    
    # Set Quicksight dashboard metadata
    dashboardId = get_dashboard_id(business_name)
    namespace = 'default'
    identity_type = 'QUICKSIGHT'
    allowedDomains = [os.environ['allowed_domains']]
    roleArn = os.environ['quicksight_role_arn']
    
    # Retrieve the AWS Account ID
    sts_client = boto3.client('sts')
    identity = sts_client.get_caller_identity()
    accountId = identity['Account']
    aws_region = os.environ.get('AWS_REGION')
    
    # Set user and session metadata
    userArn = f'arn:aws:quicksight:{aws_region}:{accountId}:user/default/{user_email}'
    sessionName = business_name
    
    res = getEmbeddingURL(accountId, dashboardId, userArn, allowedDomains, roleArn, sessionName, sts_client)

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://query.shoutavouch.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
        }, 
        'body': json.dumps(res['EmbedUrl'])
    }
