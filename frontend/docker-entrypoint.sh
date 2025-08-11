#!/bin/sh

# Docker entrypoint script for frontend
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting frontend container..."

# Set default backend URL if not provided
REACT_APP_API_URL=${REACT_APP_API_URL:-"http://localhost:5000"}

log "Backend API URL: $REACT_APP_API_URL"

# Replace environment variables in built files
if [ -d "/usr/share/nginx/html" ]; then
    log "Replacing environment variables in built files..."
    
    # Replace API URL in JavaScript files
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$REACT_APP_API_URL|g" {} \;
    
    log "Environment variables replaced successfully"
fi

# Validate nginx configuration
log "Validating nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    log "Nginx configuration is valid"
else
    log "ERROR: Nginx configuration is invalid"
    exit 1
fi

# Start nginx
log "Starting nginx..."
exec "$@"