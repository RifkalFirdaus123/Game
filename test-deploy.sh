#!/bin/bash

# Testing Deploy Script untuk Vercel

VERCEL_URL="https://game-nine-omega-15.vercel.app"
TEST_EMAIL="test@example.com"

echo "🚀 Testing Vercel Deployment"
echo "=============================="
echo ""

# Test 1: Homepage
echo "📋 Test 1: Homepage"
echo "GET $VERCEL_URL/"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$VERCEL_URL/"
echo ""

# Test 2: Admin Page
echo "📋 Test 2: Admin Page"
echo "GET $VERCEL_URL/admin"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$VERCEL_URL/admin"
echo ""

# Test 3: Test Email Endpoint
echo "📋 Test 3: Test Email Endpoint"
echo "POST $VERCEL_URL/api/test-email"
echo "Body: {\"email\": \"$TEST_EMAIL\"}"
echo ""
curl -s -X POST "$VERCEL_URL/api/test-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}" | jq '.'
echo ""

# Test 4: Send Email Endpoint
echo "📋 Test 4: Send Email Endpoint"
echo "POST $VERCEL_URL/api/send-email"
echo "Body: {\"email\": \"$TEST_EMAIL\", \"subject\": \"Test\", \"html\": \"<p>Test</p>\"}"
echo ""
curl -s -X POST "$VERCEL_URL/api/send-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"subject\": \"Test Deploy\", \"html\": \"<h1>Test Email</h1><p>This is a test email from Vercel deploy</p>\"}" | jq '.'
echo ""

echo "=============================="
echo "✅ Testing Complete"
echo ""
echo "Catatan:"
echo "- Jika Test Email Endpoint berhasil, response akan berisi success:true dan id"
echo "- Jika gagal dengan error 'API key not configured', set RESEND_API_KEY di Vercel"
echo "- Cek Vercel logs untuk debugging: vercel logs"
