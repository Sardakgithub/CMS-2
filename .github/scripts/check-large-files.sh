#!/usr/bin/env bash
# Exit on errors
set -euo pipefail

# Threshold in bytes (5 MB)
THRESHOLD=$((5 * 1024 * 1024))
echo "Checking for files larger than $THRESHOLD bytes in the repository..."
EXIT_CODE=0

# Use git ls-files to check tracked files
while IFS= read -r -d '' file; do
  # Skip .git directory if present
  if [[ "$file" == .git* ]]; then
    continue
  fi
  if [[ -f "$file" ]]; then
    size=$(wc -c <"$file" | tr -d ' ')
    if (( size > THRESHOLD )); then
      echo "Large file detected: $file (${size} bytes)"
      EXIT_CODE=2
    fi
  fi
done < <(git ls-files -z)

if (( EXIT_CODE != 0 )); then
  echo "One or more files exceed the ${THRESHOLD} byte threshold. Please remove large files or use Git LFS." >&2
  exit $EXIT_CODE
fi

echo "No large files found."
