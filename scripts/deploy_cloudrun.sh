#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
else
  echo "❌ .env.local not found."
  exit 1
fi

PROJECT_ID=$(gcloud config get-value project)
APP_NAME="sherpa-repair-system"
IMAGE_URL="gcr.io/${PROJECT_ID}/${APP_NAME}"
REGION="asia-northeast1"

echo "🚀 Starting deployment to Google Cloud Run..."
echo "Project ID: ${PROJECT_ID}"
echo "Region: ${REGION}"

# 1. Enable necessary APIs (just in case)
echo "🔧 Enabling necessary APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# 2. Build and Push Container Image
echo "📦 Building and Pushing Container Image..."
gcloud builds submit --tag ${IMAGE_URL} .

# 3. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${APP_NAME} \
  --image ${IMAGE_URL} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_SHEET_ID_CASES="${GOOGLE_SHEET_ID_CASES}" \
  --set-env-vars GOOGLE_SHEET_ID_TECHNICIANS="${GOOGLE_SHEET_ID_TECHNICIANS}" \
  --set-env-vars GOOGLE_CLIENT_EMAIL="${GOOGLE_CLIENT_EMAIL}" \
  --set-env-vars GOOGLE_PRIVATE_KEY="${GOOGLE_PRIVATE_KEY}"

echo "✅ Deployment Complete!"
