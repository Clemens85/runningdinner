#!/usr/bin/env bash
# Setup implementation plan for a feature
#
# Usage: ./setup-plan.sh [--json] [-h]

set -e

JSON=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json|-Json) JSON=true ;;
        -h|--help|-Help)
            echo "Usage: ./setup-plan.sh [--json] [-h]"
            echo "  --json    Output results in JSON format"
            echo "  -h        Show this help message"
            exit 0 ;;
        *) echo "Unknown option: $1" >&2; exit 1 ;;
    esac
    shift
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

get_feature_paths

if ! test_feature_branch "$CURRENT_BRANCH" "$HAS_GIT"; then
    exit 1
fi

mkdir -p "$FEATURE_DIR"

template="$REPO_ROOT/.specify/templates/plan-template.md"
if [ -f "$template" ]; then
    cp "$template" "$IMPL_PLAN"
    echo "Copied plan template to $IMPL_PLAN"
else
    echo "Warning: Plan template not found at $template" >&2
    touch "$IMPL_PLAN"
fi

if [ "$JSON" = true ]; then
    printf '{"FEATURE_SPEC":"%s","IMPL_PLAN":"%s","SPECS_DIR":"%s","BRANCH":"%s","HAS_GIT":%s}\n' \
        "$FEATURE_SPEC" "$IMPL_PLAN" "$FEATURE_DIR" "$CURRENT_BRANCH" "$HAS_GIT"
else
    echo "FEATURE_SPEC: $FEATURE_SPEC"
    echo "IMPL_PLAN: $IMPL_PLAN"
    echo "SPECS_DIR: $FEATURE_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
    echo "HAS_GIT: $HAS_GIT"
fi
