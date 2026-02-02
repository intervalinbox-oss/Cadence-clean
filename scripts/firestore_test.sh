#!/usr/bin/env bash
set -euo pipefail

API_KEY=$(grep NEXT_PUBLIC_FIREBASE_API_KEY .env.local | cut -d= -f2-)
PROJECT_ID=$(grep NEXT_PUBLIC_FIREBASE_PROJECT_ID .env.local | cut -d= -f2-)
TIMESTAMP=$(date +%s)
EMAIL="test+${TIMESTAMP}@example.com"
PASSWORD="Testpass123!"

echo "Using project: $PROJECT_ID"

# Sign up user
echo "Signing up temporary user: $EMAIL"
SIGNUP_RES=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"returnSecureToken\":true}")

ID_TOKEN=$(echo "$SIGNUP_RES" | python3 -c 'import sys, json; j=json.load(sys.stdin); print(j.get("idToken",""))')
LOCAL_ID=$(echo "$SIGNUP_RES" | python3 -c 'import sys, json; j=json.load(sys.stdin); print(j.get("localId",""))')

if [ -z "$ID_TOKEN" ]; then
  echo "Sign-up failed: $SIGNUP_RES"
  exit 1
fi

echo "Signed up uid=$LOCAL_ID"

# Create a Firestore document in collection 'decisions'
HEADING=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > /tmp/doc_payload.json <<JSON
{
  "fields": {
    "uid": { "stringValue": "${LOCAL_ID}" },
    "summary": { "stringValue": "Automated test decision ${TIMESTAMP}" },
    "stepsData": { "mapValue": { "fields": {
      "title": { "stringValue": "Automated Test Title ${TIMESTAMP}" },
      "description": { "stringValue": "This is a test description" },
      "preferred": { "stringValue": "email" }
    } } },
    "createdAt": { "timestampValue": "${HEADING}" }
  }
}
JSON

echo "Creating Firestore document..."
CREATE_RES=$(curl -s -X POST "https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/decisions" \
  -H "Authorization: Bearer ${ID_TOKEN}" -H "Content-Type: application/json" -d @/tmp/doc_payload.json)

echo "Create response: $CREATE_RES"

# Clean up: delete the test user
echo "Deleting temporary user..."
DEL_RES=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"idToken\":\"${ID_TOKEN}\"}")

echo "Delete response: $DEL_RES"

echo "Done"
