#!/bin/bash

# Create credentials file for reg.ru if environment variables are provided
if [ ! -z "$REGRU_USERNAME" ] && [ ! -z "$REGRU_PASSWORD" ]; then
    echo "Creating reg.ru credentials file..."
    mkdir -p /etc/letsencrypt
    cat > /etc/letsencrypt/regru.ini <<EOF
# Reg.ru API credentials
dns_regru_username = $REGRU_USERNAME
dns_regru_password = $REGRU_PASSWORD
EOF
    # Set proper permissions
    chmod 600 /etc/letsencrypt/regru.ini
    echo "Credentials file created."
else
    echo "WARNING: REGRU_USERNAME and/or REGRU_PASSWORD environment variables not set."
    echo "The dns-regru authenticator will not work without credentials."
fi
