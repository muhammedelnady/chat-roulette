#!/bin/bash
set -e

ERRORS=0

NEW_USECASE=$(grep -rn "\bnew\b.*UseCase" src/presentation --include="*.ts" --include="*.tsx" | grep -v "__tests__" | grep -v ".test." || true)
if [ -n "$NEW_USECASE" ]; then
  echo "❌ FAIL: Direct UseCase instantiation in presentation:"
  echo "$NEW_USECASE"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: No direct UseCase instantiation in presentation"
fi

REPO_IMPORTS=$(grep -rn "from.*repositories/" src/presentation --include="*.ts" --include="*.tsx" \
  | grep -v "__tests__" | grep -v ".test." | grep -v "\/I[A-Z][a-zA-Z]*Repository" || true)
if [ -n "$REPO_IMPORTS" ]; then
  echo "❌ FAIL: Concrete repository imports in presentation:"
  echo "$REPO_IMPORTS"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: No concrete repository imports in presentation"
fi

if [ $ERRORS -gt 0 ]; then
  exit 1
fi
echo "✅ All DI checks passed!"
