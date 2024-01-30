import json
import boto3
import botocore
import os

def lambda_handler(event, context):
    bucket_name = os.environ['bucket_name']
    object_prefix = event["queryStringParameters"]['file_prefix']

    # Initialize an S3 client
    s3_client = boto3.client('s3')

    try:
        # Download the S3 object
        response = s3_client.get_object(Bucket=bucket_name, Key=object_prefix)
        
        # Read the content of the object
        file_content = response['Body'].read()
        
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "https://query.onreaction.com",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },  
            'body': file_content.decode('utf-8')
        }
    except botocore.exceptions.ClientError as e:
        # Handle any errors that may occur during the S3 operation
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "https://query.onreaction.com",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
            'body': json.dumps({'error': str(e)})
        }

