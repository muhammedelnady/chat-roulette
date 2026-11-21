#!/bin/bash
set -e

ERRORS=0

DOMAIN_OUTWARD=$(grep -Ern "from ['\"](@/src/(data|presentation|infrastructure|di)|@(data|presentation|infrastructure|di|stores)|expo-|react-native)" \
  src/domain --include="*.ts" | grep -v "__tests__" | grep -v "\.test\." || true)
if [ -n "$DOMAIN_OUTWARD" ]; then
  echo "❌ FAIL: Domain layer imports outward layer or platform SDK:"
  echo "$DOMAIN_OUTWARD"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Domain layer has zero outward or platform dependencies"
fi

INFRA_DATA=$(grep -Ern "from ['\"](@/src/data|@data)" \
  src/infrastructure --include="*.ts" --include="*.tsx" | grep -v "__tests__" | grep -v "\.test\." || true)
if [ -n "$INFRA_DATA" ]; then
  echo "❌ FAIL: Infrastructure layer imports data layer:"
  echo "$INFRA_DATA"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Infrastructure layer has zero data imports"
fi

DATA_PRES=$(grep -Ern "from ['\"](@/src/presentation|@presentation|@stores)" \
  src/data --include="*.ts" | grep -v "__tests__" | grep -v "\.test\." || true)
if [ -n "$DATA_PRES" ]; then
  echo "❌ FAIL: Data layer imports presentation layer:"
  echo "$DATA_PRES"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Data layer has zero presentation imports"
fi

PRES_DATA=$(grep -Ern "from ['\"](@/src/data|@data|expo-haptics)" \
  src/presentation app --include="*.ts" --include="*.tsx" | grep -v "__tests__" | grep -v "\.test\." || true)
if [ -n "$PRES_DATA" ]; then
  echo "❌ FAIL: Presentation layer imports data layer or raw expo-haptics directly:"
  echo "$PRES_DATA"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Presentation layer has zero direct data or raw expo-haptics imports"
fi

if [ $ERRORS -gt 0 ]; then
  exit 1
fi
echo "✅ All architecture boundary checks passed!"
