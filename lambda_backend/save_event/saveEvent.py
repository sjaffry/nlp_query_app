import json
import boto3
import base64
import hashlib
import os

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb')

# Specify the table name
table_name = os.environ['table_name']
# Reference the DynamoDB table
table = dynamodb.Table(table_name)

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
    
def get_hashed_url(business_name, event_name):
    
    # Encode the business_name to bytes, then hash it
    hashed_bn = hashlib.sha256(business_name.encode()).hexdigest()
    
    # Encode the event_name to bytes, then hash it
    hashed_en = hashlib.sha256(event_name.encode()).hexdigest()
    
    hashed_url = f'https://feedback.onreaction.com/TextInput/?qs={hashed_bn}/{hashed_en}'
    
    return hashed_url


def upsert_item(item):
    # Here we prepare to Upsert the new item
    primary_key = {
        'business_name': item["business_name"], 
        'event_name': item["event_name"]
    }
    
    # Define the attributes to be updated
    update_expression = 'SET friendly_name = :fn, event_url = :url, active = :act'
    expression_attribute_values = {
        ':fn': item["friendly_name"],
        ':url': item["event_url"],
        ':act': item["active"]
    }
    
    # Save the data to the table
    try:
        response = table.update_item(
            Key=primary_key,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="UPDATED_NEW"
    )
    except Exception as e:
        raise e
        
    return response


def lambda_handler(event, context):
    
    # Let's extract the business name from the token by looking at the group memebership of the user
    token = event['auth_token']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]
    friendly_name = event['event_name']
    active_status = event['active']
    event_name = friendly_name.replace(" ", "").lower()
    url = get_hashed_url(business_name, event_name)
    
    # If active flag = Y then it's an update and we need to deactivate the prevously active event
    if active_status == 'Y':
        # Query parameters
        partition_key_value = business_name
        active_value = 'Y'

        try:
            response = table.query(
                KeyConditionExpression='business_name = :bn',
                FilterExpression='active = :active',
                ExpressionAttributeValues={
                    ':bn': partition_key_value,
                    ':active': active_value
                }
            )
            
            items = response['Items']
            
            if len(items) > 0:
                old_item = items[0]
                old_item["active"] = 'N'
                upsert_item(old_item)
        
        except Exception as e:
            print('Error querying DynamoDB:', e)

    
    # Upsert a new item
    new_event = {
        "business_name": business_name,
        "event_name": event_name,
        "friendly_name": friendly_name,
        "active": active_status,
        "event_url": url
    }
    response = upsert_item(new_event)
    
    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://query.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET,DELETE"
    },    
        'body': json.dumps(url)
    } 
