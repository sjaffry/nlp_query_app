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
    # Let's extract the business name from the token by looking at the group memebership of the user
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]
    event_name = event["queryStringParameters"]['event_name'].replace(" ", "").lower()
    
    # Initialize a DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    # Specify the table name
    table_name = bucket_name = os.environ['table_name']
    # Reference the DynamoDB table
    table = dynamodb.Table(table_name)
    
    Key={
        'business_name': business_name,
        'event_name': event_name
    }
    
    # Delete the item
    try:
        response = table.delete_item(
            Key=Key
        )
        print('Item deleted successfully:', response)
        
    except Exception as e:
        print('Error deleting item from DynamoDB:', e)
    
    
    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://query.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET,DELETE"
        }
    } 
