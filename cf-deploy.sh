#!/usr/bin/env bash
# Deploy app/ to Cloudflare Pages (project: strivon)
set -e; cd "$(dirname "$0")"
wrangler pages deploy app --project-name=strivon --branch=main --commit-dirty=true
