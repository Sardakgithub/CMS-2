#!/usr/bin/env bash
set -euo pipefail

# Helper to build and run the API Docker image locally for verification.
# Usage: ./deploy/run-local.sh [port]
# Requires Docker installed.

PORT=${1:-10000}
IMAGE_NAME="chronos-api:local"

echo "Building Docker image ${IMAGE_NAME}..."
docker build -t ${IMAGE_NAME} .

ENV_FILE="apps/api/.env"
if [ ! -f "${ENV_FILE}" ]; then
  echo "WARNING: ${ENV_FILE} not found. Create it with the required environment variables before running the container. Exiting."
  exit 1
fi

echo "Running container on port ${PORT} (use Ctrl+C to stop)..."
docker run --rm -p ${PORT}:10000 --env-file ${ENV_FILE} ${IMAGE_NAME}
