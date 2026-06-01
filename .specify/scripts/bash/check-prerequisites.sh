#!/usr/bin/env bash
# Consolidated prerequisite checking script (Bash)
#
# Mirrors check-prerequisites.ps1 behavior.
#
# Usage: ./check-prerequisites.sh [OPTIONS]
#
# OPTIONS:
#   --json, -Json               Output in JSON format
#   --require-tasks, -RequireTasks   Require tasks.md to exist
#   --include-tasks, -IncludeTasks   Include tasks.md in AVAILABLE_DOCS list
#   --paths-only, -PathsOnly         Only output path variables (no validation)
#   -h, --help                  Show help message

set -e

JSON=false
REQUIRE_TASKS=false
INCLUDE_TASKS=false
PATHS_ONLY=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --json|-Json)              JSON=true ;;
        --require-tasks|-RequireTasks) REQUIRE_TASKS=true ;;
        --include-tasks|-IncludeTasks) INCLUDE_TASKS=true ;;
        --paths-only|-PathsOnly)   PATHS_ONLY=true ;;
        -h|--help|-Help)
            cat <<'EOF'
Usage: check-prerequisites.sh [OPTIONS]

Consolidated prerequisite checking for Spec-Driven Development workflow.

OPTIONS:
  --json              Output in JSON format
  --require-tasks     Require tasks.md to exist (for implementation phase)
  --include-tasks     Include tasks.md in AVAILABLE_DOCS list
  --paths-only        Only output path variables (no prerequisite validation)
  -h, --help          Show this help message

EXAMPLES:
  ./check-prerequisites.sh --json
  ./check-prerequisites.sh --json --require-tasks --include-tasks
  ./check-prerequisites.sh --paths-only
EOF
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

# --paths-only mode: output paths and exit
if [ "$PATHS_ONLY" = true ]; then
    if [ "$JSON" = true ]; then
        printf '{"REPO_ROOT":"%s","BRANCH":"%s","FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","TASKS":"%s"}\n' \
            "$REPO_ROOT" "$CURRENT_BRANCH" "$FEATURE_DIR" "$FEATURE_SPEC" "$IMPL_PLAN" "$TASKS"
    else
        echo "REPO_ROOT: $REPO_ROOT"
        echo "BRANCH: $CURRENT_BRANCH"
        echo "FEATURE_DIR: $FEATURE_DIR"
        echo "FEATURE_SPEC: $FEATURE_SPEC"
        echo "IMPL_PLAN: $IMPL_PLAN"
        echo "TASKS: $TASKS"
    fi
    exit 0
fi

# Validate required directories and files
if [ ! -d "$FEATURE_DIR" ]; then
    echo "ERROR: Feature directory not found: $FEATURE_DIR"
    echo "Run /speckit.specify first to create the feature structure."
    exit 1
fi

if [ ! -f "$IMPL_PLAN" ]; then
    echo "ERROR: plan.md not found in $FEATURE_DIR"
    echo "Run /speckit.plan first to create the implementation plan."
    exit 1
fi

if [ "$REQUIRE_TASKS" = true ] && [ ! -f "$TASKS" ]; then
    echo "ERROR: tasks.md not found in $FEATURE_DIR"
    echo "Run /speckit.tasks first to create the task list."
    exit 1
fi

# Build available docs list
docs=()
[ -f "$RESEARCH" ]    && docs+=("research.md")
[ -f "$DATA_MODEL" ]  && docs+=("data-model.md")
if [ -d "$CONTRACTS_DIR" ] && [ -n "$(ls -A "$CONTRACTS_DIR" 2>/dev/null)" ]; then
    docs+=("contracts/")
fi
[ -f "$QUICKSTART" ]  && docs+=("quickstart.md")
[ "$INCLUDE_TASKS" = true ] && [ -f "$TASKS" ] && docs+=("tasks.md")

# Output results
if [ "$JSON" = true ]; then
    docs_json="["
    first=true
    for doc in "${docs[@]}"; do
        [ "$first" = true ] && first=false || docs_json+=","
        docs_json+="\"$doc\""
    done
    docs_json+="]"
    printf '{"FEATURE_DIR":"%s","AVAILABLE_DOCS":%s}\n' "$FEATURE_DIR" "$docs_json"
else
    echo "FEATURE_DIR:$FEATURE_DIR"
    echo "AVAILABLE_DOCS:"
    test_file_exists "$RESEARCH"      "research.md"  || true
    test_file_exists "$DATA_MODEL"    "data-model.md" || true
    test_dir_has_files "$CONTRACTS_DIR" "contracts/"  || true
    test_file_exists "$QUICKSTART"    "quickstart.md" || true
    [ "$INCLUDE_TASKS" = true ] && { test_file_exists "$TASKS" "tasks.md" || true; }
fi
