#!/bin/bash
set -e

ERRORS=0

DOMAIN_OUTWARD=$(grep -rn "from \"@/src/\(data\|presentation\|infrastructure\|di\)\|from \"@\(data\|presentation\|infrastructure\|di\|stores\)" \
  src/domain --include="*.ts" | grep -v "__tests__" | grep -v ".test.ts" || true)
if [ -n "$DOMAIN_OUTWARD" ]; then
  echo "❌ FAIL: Domain layer imports outward layer:"
  echo "$DOMAIN_OUTWARD"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Domain layer has zero outward dependencies"
fi

DATA_PRES=$(grep -rn "from \"@/src/presentation\|from \"@presentation\|from \"@stores" \
  src/data --include="*.ts" | grep -v "__tests__" | grep -v ".test.ts" || true)
if [ -n "$DATA_PRES" ]; then
  echo "❌ FAIL: Data layer imports presentation layer:"
  echo "$DATA_PRES"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Data layer has zero presentation imports"
fi

PRES_DATA=$(grep -rn "from \"@/src/data\|from \"@data" \
  src/presentation --include="*.ts" --include="*.tsx" | grep -v "__tests__" | grep -v ".test.ts" | grep -v ".test.tsx" || true)
if [ -n "$PRES_DATA" ]; then
  echo "❌ FAIL: Presentation layer imports data layer directly:"
  echo "$PRES_DATA"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Presentation layer has zero direct data imports"
fi

if [ $ERRORS -gt 0 ]; then
  exit 1
fi
echo "✅ All architecture boundary checks passed!"
