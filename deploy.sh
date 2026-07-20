#!/usr/bin/env bash
# Deploy app/ to GitHub Pages (branch method — GitHub Actions is billing-locked on this account).
# Publishes the app/ subfolder to the gh-pages branch root and triggers a Pages build.
set -e
cd "$(dirname "$0")"
echo "→ splitting app/ and pushing to gh-pages…"
git push origin "$(git subtree split --prefix app)":refs/heads/gh-pages --force
echo "→ triggering Pages build…"
gh api -X POST repos/soumyadg/stride-coach/pages/builds >/dev/null
echo "✅ Deployed → https://soumyadg.github.io/stride-coach/  (allow ~30s for the build)"
