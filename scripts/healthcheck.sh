#!/bin/bash
# ==============================================================================
# ForgeMD Health Check Script
# ==============================================================================

echo "Checking ForgeMD Health..."

FAILURES=0

# Check pdftotext
if ! command -v pdftotext &> /dev/null; then
    echo "[FAIL] pdftotext could not be found. PDF conversion will fail."
    FAILURES=$((FAILURES+1))
else
    echo "[OK] pdftotext is installed."
fi

# Check pandoc
if ! command -v pandoc &> /dev/null; then
    echo "[FAIL] pandoc could not be found. DOCX conversion will fail."
    FAILURES=$((FAILURES+1))
else
    echo "[OK] pandoc is installed."
fi

# Check local API response
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:3000/api/health)

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "[OK] API is responding (HTTP 200)."
else
    echo "[FAIL] API is not responding. Received HTTP code: $HTTP_STATUS"
    FAILURES=$((FAILURES+1))
fi

if [ $FAILURES -gt 0 ]; then
    echo "Healthcheck completed with $FAILURES failures."
    exit 1
else
    echo "Healthcheck passed successfully."
    exit 0
fi
