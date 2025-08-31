#!/usr/bin/env sh
# Setup script for Husky git hooks
# Run this after npm/bun install

echo "Setting up Husky git hooks..."

# Set git core.hooksPath to use Husky hooks
git config core.hooksPath .husky

echo "Husky setup complete! Pre-commit hooks are now active."
echo "The following will run on each commit:"
echo "- ESLint --fix on staged .ts,.tsx,.js,.jsx files"
echo "- Prettier on staged files"