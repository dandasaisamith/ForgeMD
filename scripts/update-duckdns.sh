#!/bin/bash
# ==============================================================================
# DuckDNS Update Script
# ==============================================================================

ENV_FILE="/srv/forgemd/app/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Environment file $ENV_FILE not found."
    exit 1
fi

# Extract variables from .env
# This safely parses the env file ignoring comments
export $(grep -v '^#' "$ENV_FILE" | xargs -d '\n')

if [ -z "$DUCKDNS_DOMAIN" ] || [ -z "$DUCKDNS_TOKEN" ]; then
    echo "DUCKDNS_DOMAIN or DUCKDNS_TOKEN is not set in $ENV_FILE"
    exit 1
fi

echo "Updating DuckDNS for $DUCKDNS_DOMAIN..."
RESPONSE=$(curl -k -s "https://www.duckdns.org/update?domains=$DUCKDNS_DOMAIN&token=$DUCKDNS_TOKEN&ip=")

if [ "$RESPONSE" == "OK" ]; then
    echo "DuckDNS update successful."
    exit 0
else
    echo "DuckDNS update failed. Response: $RESPONSE"
    exit 1
fi
