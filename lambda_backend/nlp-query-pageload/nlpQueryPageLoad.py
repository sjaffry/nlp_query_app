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
    """Decode JWT token and return payload"""
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError('Token is not valid')

    header = decode_base64_url(parts[0])
    payload = decode_base64_url(parts[1])
    signature = decode_base64_url(parts[2])

    return json.loads(payload)

def trimmed_foldername(full_folderpath):
    return os.path.basename(os.path.normpath(full_folderpath))

def list_subfolders(prefix):
    response = s3.list_objects_v2(Bucket=bucket_name, Delimiter='/', Prefix=prefix)
    subfolders = []

    for content in response.get('CommonPrefixes', []):
        folder_name = trimmed_foldername(content.get('Prefix'))
        if folder_name != 'archive':
            subfolders.append(folder_name)
    return subfolders

def lambda_handler(event, context):
    get_events = event["queryStringParameters"]['get_events']
    keep_warm = event["queryStringParameters"]['keep_warm']
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    business_name = decoded['cognito:groups'][0]

    if keep_warm == "true":
        return {'body': json.dumps('stay warm!')}

    if get_events == "True":
        prefix = f'transcribe-output/{business_name}/events/'
    else:
        prefix = f'transcribe-output/{business_name}/'

    subfolders = list_subfolders(prefix)
    result = {
        "Business name": business_name,
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
