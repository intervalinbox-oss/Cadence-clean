#!/bin/bash
set -e

echo "=== SIMPLE FIRESTORE TEST ==="

API_KEY=$(grep NEXT_PUBLIC_FIREBASE_API_KEY .env.local | cut -d '=' -f2)
PROJECT_ID=cadence-956b5

EMAIL="test_$(date +%s)@example.com"
PASSWORD="test123"

echo "Creating test user: $EMAIL"

SIGNUP_RESPONSE=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\", \"returnSecureToken\":true}")

ID_TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.idToken')
LOCAL_ID=$(echo $SIGNUP_RESPONSE | jq -r '.localId')

echo "User created:"
echo "  UID: $LOCAL_ID"
echo "  ID Token: ${#ID_TOKEN} chars"

echo "Writing test Firestore doc..."

WRITE_RESPONSE=$(curl -s -X POST \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/decisions?documentId=test_$(date +%s)" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"fields\": {
      \"uid\": {\"stringValue\": \"$LOCAL_ID\"},
      \"summary\": {\"stringValue\": \"Test Decision\"}
    }
  }")

echo "WRITE RESPONSE:"
echo "$WRITE_RESPONSE"

echo "=== DONE ==="
