#!/usr/bin/env bash
# Himalaya ERP - Root Deployment Entrypoint
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/scripts/deploy-vps.sh" "$@"
