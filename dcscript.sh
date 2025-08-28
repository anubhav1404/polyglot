#!/bin/bash

# This script fetches AWS credentials from the local
# ~/.aws/credentials file and creates a .env file for Docker Compose.

# The credentials file is usually located in the home directory
# of the user who ran `aws configure`.
CREDENTIALS_FILE="/home/ubuntu/.aws/credentials"

# Check if the credentials file exists
if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo "Error: AWS credentials file not found at $CREDENTIALS_FILE"
    echo "Please run 'aws configure' as the 'ubuntu' user first."
    exit 1
fi

# Fetch AWS credentials from the file using grep and awk
# We're specifically looking for the 'default' profile.
AWS_ACCESS_KEY_ID=$(grep 'aws_access_key_id' "$CREDENTIALS_FILE" | head -n 1 | awk '{print $3}')
AWS_SECRET_ACCESS_KEY=$(grep 'aws_secret_access_key' "$CREDENTIALS_FILE" | head -n 1 | awk '{print $3}')

# Check if the keys were successfully retrieved
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "Error: Failed to extract AWS credentials from $CREDENTIALS_FILE."
    echo "Please ensure the file is correctly formatted with the 'default' profile."
    exit 1
fi

# Create the .env file in your project directory
cat <<EOF > /home/ubuntu/polyglot/.env
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
EOF

# Navigate to your project directory and start the services
cd /home/ubuntu/polyglot || { echo "Failed to change directory."; exit 1; }
docker compose up -d

echo "Script complete! Docker containers are starting up in the background."
