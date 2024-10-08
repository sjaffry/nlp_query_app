import base64
import json
import os
import boto3

s3 = boto3.client('s3')
bucket_name = os.environ['bucket_name']

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
    
def trimmed_foldername(full_folderpath):
    return os.path.basename(os.path.normpath(full_folderpath))
    

def list_subfolders(bucket_name, prefix):

    response = s3.list_objects_v2(Bucket=bucket_name, Delimiter='/', Prefix=prefix)
    subfolders = []

    for content in response.get('CommonPrefixes', []):
        folder_name = trimmed_foldername(content.get('Prefix'))
        if folder_name != 'archive':
            subfolders.append(folder_name)
    return subfolders


def lambda_handler(event, context):
    
    # Let's extract the business name from the token by looking at the group memebership of the user
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]
    event_name = event["queryStringParameters"]['event_name']
    keep_warm = event["queryStringParameters"]['keep_warm']
    
    if keep_warm == "true":
        return {'body': json.dumps('stay warm!')}
    
    # Now we list all the subfolders for the business name
    prefix = f'transcribe-output/{business_name}/events/{event_name}/'
    subfolders = list_subfolders(bucket_name, prefix)
    result = {
        "Business name": business_name,
        "Event name": event_name,
        "Subfolders": subfolders
        }
        
    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://query.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': json.dumps(result)
    } 
