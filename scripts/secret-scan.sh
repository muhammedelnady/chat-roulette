#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/.."

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks CLI not installed"
  exit 1
fi

gitleaks dir . --config .gitleaks.toml --redact
if [ -d .git ]; then
  gitleaks git . --config .gitleaks.toml --redact
fi
