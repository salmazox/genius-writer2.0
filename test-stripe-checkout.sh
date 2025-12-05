#!/bin/bash

# Test Stripe Checkout Integration
# Replace these values with your actual data

API_URL="https://genius-writer.up.railway.app"
AUTH_TOKEN="your-jwt-token-here"  # Get this from localStorage after logging in

echo "Testing Stripe Checkout Session Creation..."

curl -X POST "$API_URL/api/billing/create-checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "plan": "PRO",
    "billingPeriod": "monthly"
  }' | jq

echo ""
echo "If successful, you should get a checkout URL. Open it in your browser and complete the test payment."
echo "Use test card: 4242 4242 4242 4242"
