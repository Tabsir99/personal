#!/usr/bin/env bash
set -uo pipefail

readonly SKIP_BUILD=0
readonly RUN_BUILD=1

app="${1:-}"
if [ -z "$app" ]; then
  echo "usage: vercel-should-build.sh <admin|portfolio>" >&2
  exit $RUN_BUILD
fi

watch=(
  ./
  ../../packages/schemas
  ../../pnpm-lock.yaml
  ../../pnpm-workspace.yaml
  ../../package.json
)
exclude=(
  ':(exclude)*.md'
  ':(exclude).claude'
  ':(exclude)../../packages/schemas/*.md'
)

if [ "$app" = "admin" ]; then
  watch+=(../../packages/analytics)
  exclude+=(
    ':(exclude)src/test'
    ':(exclude)../../packages/analytics/*.md'
    ':(exclude)../../packages/analytics/**/*.test.ts'
  )
fi

git rev-parse --verify HEAD^ >/dev/null 2>&1 || exit $RUN_BUILD

if git diff --quiet HEAD^ HEAD -- "${watch[@]}" "${exclude[@]}"; then
  exit $SKIP_BUILD
fi

exit $RUN_BUILD
