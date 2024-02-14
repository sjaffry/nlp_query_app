import json
import boto3
import base64
import os

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

def lambda_handler(event, context):
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]
    # Initialize a DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    
    # Specify your table name
    table_name = os.environ['table_name']
    
    # Specify the partition key name and value
    partition_key_name = 'business_name'
    partition_key_value = business_name
    
    # Reference the DynamoDB table
    table = dynamodb.Table(table_name)
    
    # Query the items
    try:
        response = table.query(
            KeyConditionExpression=f"{partition_key_name} = :value",
            ExpressionAttributeValues={
                ':value': partition_key_value
            }
        )
        items = response.get('Items', [])

    except Exception as e:
        print('Error querying items from DynamoDB:', e)

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://query.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': json.dumps(items)
    } 