#!/bin/bash

set -e

echo "=== Firestore Authenticated Write Test ==="

API_KEY=$(grep NEXT_PUBLIC_FIREBASE_API_KEY .env.local | cut -d '=' -f2)
PROJECT_ID=$(grep NEXT_PUBLIC_FIREBASE_PROJECT_ID .env.local | cut -d '=' -f2)

echo "Using Project: $PROJECT_ID"

# 1. Sign up temp user
echo "Creating temporary user..."
SIGNUP_RESPONSE=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser_temp@example.com","password":"test12345","returnSecureToken":true}')

ID_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"idToken":"[^"]*"' | cut -d':' -f2 | tr -d '"')
LOCAL_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"localId":"[^"]*"' | cut -d':' -f2 | tr -d '"')

if [ -z "$ID_TOKEN" ]; then
  echo "❌ Sign-up failed:"
  echo "$SIGNUP_RESPONSE"
  exit 1
fi

echo "✔ Temporary user created: $LOCAL_ID"

# 2. Attempt Firestore write
echo "Writing to Firestore..."
WRITE_RESPONSE=$(curl -s -X POST \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/decisions" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"fields\": {\"uid\": {\"stringValue\": \"$LOCAL_ID\"}, \"test\": {\"stringValue\": \"ok\"}}}")

echo "$WRITE_RESPONSE"

if echo "$WRITE_RESPONSE" | grep -q "error"; then
  echo "❌ Firestore write FAILED"
else
  echo "✔ Firestore write SUCCEEDED"
fi

# 3. Delete user
echo "Deleting temporary user..."
DELETE_RESPONSE=$(curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"idToken\":\"$ID_TOKEN\"}")

echo "$DELETE_RESPONSE"

echo "=== Test Complete ==="
