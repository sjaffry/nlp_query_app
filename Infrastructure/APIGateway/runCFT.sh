#!/bin/bash

# Check if a filename is provided as an argument
if [ $# -ne 1 ]; then
    echo "Usage: $0 <word_list_file>"
    exit 1
fi

word_list_file="$1"

# Check if the input file exists
if [ ! -e "$word_list_file" ]; then
    echo "File not found: $word_list_file"
    exit 1
fi

# Loop through each word in the file and use it as a parameter for touch
while IFS= read -r word; do
    aws cloudformation create-stack \
  --stack-name "API-$word" \
  --template-body file://API.yaml \
  --parameters ParameterKey=apiGatewayName,ParameterValue=$word ParameterKey=lambdaFunctionName,ParameterValue=$word ParameterKey=lambdaFunctionArn,ParameterValue=arn:aws:lambda:us-west-1:303830944942:function:$word \
  --capabilities CAPABILITY_IAM

done < "$word_list_file"

echo "Script execution complete!"

