#!/usr/bin/env bash
# Common Bash functions — analogous to common.ps1

get_repo_root() {
    local result
    result=$(git rev-parse --show-toplevel 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "$result"
        return
    fi
    # Fall back to script location for non-git repos (3 levels up from scripts/bash/)
    cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd
}

get_current_branch() {
    # Check SPECIFY_FEATURE env var first
    if [ -n "${SPECIFY_FEATURE:-}" ]; then
        echo "$SPECIFY_FEATURE"
        return
    fi

    # Then try git
    local result
    result=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "$result"
        return
    fi

    # Fall back to latest numbered feature directory
    local repo_root specs_dir latest_feature highest
    repo_root=$(get_repo_root)
    specs_dir="$repo_root/specs"
    latest_feature=""
    highest=0

    if [ -d "$specs_dir" ]; then
        for d in "$specs_dir"/*/; do
            [ -d "$d" ] || continue
            name=$(basename "$d")
            if [[ "$name" =~ ^([0-9]+)- ]]; then
                num=$((10#${BASH_REMATCH[1]}))
                if [ "$num" -gt "$highest" ]; then
                    highest=$num
                    latest_feature=$name
                fi
            fi
        done
    fi

    if [ -n "$latest_feature" ]; then
        echo "$latest_feature"
        return
    fi

    echo "main"
}

has_git() {
    git rev-parse --show-toplevel >/dev/null 2>&1
}

test_feature_branch() {
    local branch="$1"
    local has_git_flag="${2:-true}"

    if [ "$has_git_flag" != "true" ]; then
        echo "[specify] Warning: Git repository not detected; skipped branch validation" >&2
        return 0
    fi

    if ! [[ "$branch" =~ ^[0-9]{3}- ]]; then
        echo "ERROR: Not on a feature branch. Current branch: $branch"
        echo "Feature branches should be named like: 001-feature-name"
        return 1
    fi
    return 0
}

# Populates global path variables — call this instead of returning a struct
get_feature_paths() {
    local repo_root current_branch has_git_val feature_dir
    repo_root=$(get_repo_root)
    current_branch=$(get_current_branch)

    if has_git; then
        has_git_val="true"
    else
        has_git_val="false"
    fi

    feature_dir="$repo_root/specs/$current_branch"

    REPO_ROOT="$repo_root"
    CURRENT_BRANCH="$current_branch"
    HAS_GIT="$has_git_val"
    FEATURE_DIR="$feature_dir"
    FEATURE_SPEC="$feature_dir/spec.md"
    IMPL_PLAN="$feature_dir/plan.md"
    TASKS="$feature_dir/tasks.md"
    RESEARCH="$feature_dir/research.md"
    DATA_MODEL="$feature_dir/data-model.md"
    QUICKSTART="$feature_dir/quickstart.md"
    CONTRACTS_DIR="$feature_dir/contracts"
}

test_file_exists() {
    local path="$1"
    local desc="$2"
    if [ -f "$path" ]; then
        echo "  ✓ $desc"
        return 0
    else
        echo "  ✗ $desc"
        return 1
    fi
}

test_dir_has_files() {
    local path="$1"
    local desc="$2"
    if [ -d "$path" ] && [ -n "$(ls -A "$path" 2>/dev/null)" ]; then
        echo "  ✓ $desc"
        return 0
    else
        echo "  ✗ $desc"
        return 1
    fi
}
