#!/bin/bash
set -e

ERRORS=0

THROWS_UC=$(grep -rn "\bthrow\b" src/domain/usecases --include="*.ts" | grep -v "__tests__" | grep -v ".test.ts" || true)
if [ -n "$THROWS_UC" ]; then
  echo "❌ FAIL: Throw statements in use cases:"
  echo "$THROWS_UC"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: No throw statements in use cases"
fi

THROWS_REPO=$(grep -rn "\bthrow\b" src/data/repositories src/data/simulated --include="*.ts" | grep -v "__tests__" | grep -v ".test.ts" || true)
if [ -n "$THROWS_REPO" ]; then
  echo "❌ FAIL: Throw statements in repositories or simulated adapters:"
  echo "$THROWS_REPO"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: No throw statements in repositories or simulated adapters"
fi

if [ $ERRORS -gt 0 ]; then
  exit 1
fi
echo "✅ All Result pattern checks passed!"
