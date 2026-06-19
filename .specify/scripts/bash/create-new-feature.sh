#!/usr/bin/env bash
# Create a new feature branch and spec directory
#
# Usage: ./create-new-feature.sh [--json] [--short-name <name>] [--number N] <feature description>

set -e

JSON=false
SHORT_NAME=""
NUMBER=0
FEATURE_DESC=""

show_help() {
    cat <<'EOF'
Usage: ./create-new-feature.sh [--json] [--short-name <name>] [--number N] <feature description>

Options:
  --json              Output in JSON format
  --short-name <name> Provide a custom short name (2-4 words) for the branch
  --number N          Specify branch number manually (overrides auto-detection)
  -h, --help          Show this help message

Examples:
  ./create-new-feature.sh 'Add user authentication system' --short-name 'user-auth'
  ./create-new-feature.sh 'Implement OAuth2 integration for API'
EOF
}

# Parse arguments — collect positional args as feature description
while [[ $# -gt 0 ]]; do
    case "$1" in
        --json|-Json)        JSON=true; shift ;;
        --short-name|-ShortName) SHORT_NAME="$2"; shift 2 ;;
        --number|-Number)    NUMBER="$2"; shift 2 ;;
        -h|--help|-Help)     show_help; exit 0 ;;
        --)                  shift; FEATURE_DESC="$*"; break ;;
        -*)                  echo "Unknown option: $1" >&2; exit 1 ;;
        *)                   FEATURE_DESC="${FEATURE_DESC:+$FEATURE_DESC }$1"; shift ;;
    esac
done

FEATURE_DESC="${FEATURE_DESC# }"

if [ -z "$FEATURE_DESC" ]; then
    echo "Usage: ./create-new-feature.sh [--json] [--short-name <name>] <feature description>" >&2
    exit 1
fi

# ── helpers ──────────────────────────────────────────────────────────────────

find_repo_root() {
    local current="$1"
    while [ "$current" != "/" ]; do
        if [ -d "$current/.git" ] || [ -d "$current/.specify" ]; then
            echo "$current"
            return
        fi
        current="$(dirname "$current")"
    done
    # Not found
}

get_highest_from_specs() {
    local specs_dir="$1"
    local highest=0
    if [ -d "$specs_dir" ]; then
        for d in "$specs_dir"/*/; do
            [ -d "$d" ] || continue
            name=$(basename "$d")
            if [[ "$name" =~ ^([0-9]+) ]]; then
                num=$((10#${BASH_REMATCH[1]}))
                [ "$num" -gt "$highest" ] && highest=$num
            fi
        done
    fi
    echo "$highest"
}

get_highest_from_branches() {
    local highest=0
    local branches
    if branches=$(git branch -a 2>/dev/null); then
        while IFS= read -r branch; do
            # Strip leading whitespace, asterisk, and remote prefixes
            local clean="${branch#\*}"
            clean="${clean# }"
            clean="${clean#remotes/*/}"
            if [[ "$clean" =~ ^([0-9]+)- ]]; then
                num=$((10#${BASH_REMATCH[1]}))
                [ "$num" -gt "$highest" ] && highest=$num
            fi
        done <<< "$branches"
    fi
    echo "$highest"
}

get_next_branch_number() {
    local specs_dir="$1"
    git fetch --all --prune >/dev/null 2>&1 || true
    local h_branch h_spec max_num
    h_branch=$(get_highest_from_branches)
    h_spec=$(get_highest_from_specs "$specs_dir")
    max_num=$(( h_branch > h_spec ? h_branch : h_spec ))
    echo $(( max_num + 1 ))
}

to_clean_branch_name() {
    local name="${1,,}"                    # lowercase
    name="${name//[^a-z0-9]/-}"            # replace non-alphanumeric with hyphen
    # Collapse consecutive hyphens
    while [[ "$name" == *--* ]]; do name="${name//--/-}"; done
    name="${name#-}"
    name="${name%-}"
    echo "$name"
}

get_branch_name() {
    local desc="$1"
    # Stop words to filter
    local stop_words=" i a an the to for of in on at by with from is are was were be been being have has had do does did will would should could can may might must shall this that these those my your our their want need add get set "

    local clean="${desc,,}"
    clean="${clean//[^a-z0-9 ]/ }"

    local -a words meaningful
    read -r -a words <<< "$clean"

    for word in "${words[@]}"; do
        [ -z "$word" ] && continue
        [[ "$stop_words" == *" $word "* ]] && continue
        if [ "${#word}" -ge 3 ]; then
            meaningful+=("$word")
        fi
    done

    if [ "${#meaningful[@]}" -gt 0 ]; then
        local max_words=3
        [ "${#meaningful[@]}" -eq 4 ] && max_words=4
        local selected=("${meaningful[@]:0:$max_words}")
        local IFS='-'
        echo "${selected[*]}"
    else
        local fallback
        fallback=$(to_clean_branch_name "$desc")
        IFS='-' read -r -a fallback_words <<< "$fallback"
        local selected=("${fallback_words[@]:0:3}")
        local IFS='-'
        echo "${selected[*]}"
    fi
}

# ── main ──────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

fallback_root=$(find_repo_root "$SCRIPT_DIR")
if [ -z "$fallback_root" ]; then
    echo "Error: Could not determine repository root. Please run this script from within the repository." >&2
    exit 1
fi

if repo_root=$(git rev-parse --show-toplevel 2>/dev/null); then
    HAS_GIT=true
else
    repo_root="$fallback_root"
    HAS_GIT=false
fi

cd "$repo_root"

specs_dir="$repo_root/specs"
mkdir -p "$specs_dir"

# Generate branch suffix
if [ -n "$SHORT_NAME" ]; then
    branch_suffix=$(to_clean_branch_name "$SHORT_NAME")
else
    branch_suffix=$(get_branch_name "$FEATURE_DESC")
fi

# Determine branch number
if [ "$NUMBER" -eq 0 ]; then
    if [ "$HAS_GIT" = true ]; then
        NUMBER=$(get_next_branch_number "$specs_dir")
    else
        NUMBER=$(( $(get_highest_from_specs "$specs_dir") + 1 ))
    fi
fi

feature_num=$(printf '%03d' "$NUMBER")
branch_name="${feature_num}-${branch_suffix}"

# Truncate to GitHub's 244-byte limit
max_branch_length=244
if [ "${#branch_name}" -gt "$max_branch_length" ]; then
    max_suffix_length=$(( max_branch_length - 4 ))
    truncated_suffix="${branch_suffix:0:$max_suffix_length}"
    truncated_suffix="${truncated_suffix%-}"
    echo "[specify] Warning: Branch name exceeded GitHub's 244-byte limit" >&2
    echo "[specify] Original: $branch_name (${#branch_name} bytes)" >&2
    branch_name="${feature_num}-${truncated_suffix}"
    echo "[specify] Truncated to: $branch_name (${#branch_name} bytes)" >&2
fi

if [ "$HAS_GIT" = true ]; then
    git checkout -b "$branch_name" >/dev/null 2>&1 \
        || echo "Warning: Failed to create git branch: $branch_name" >&2
else
    echo "[specify] Warning: Git repository not detected; skipped branch creation for $branch_name" >&2
fi

feature_dir="$specs_dir/$branch_name"
mkdir -p "$feature_dir"

template="$repo_root/.specify/templates/spec-template.md"
spec_file="$feature_dir/spec.md"
if [ -f "$template" ]; then
    cp "$template" "$spec_file"
else
    touch "$spec_file"
fi

export SPECIFY_FEATURE="$branch_name"

if [ "$JSON" = true ]; then
    printf '{"BRANCH_NAME":"%s","SPEC_FILE":"%s","FEATURE_NUM":"%s","HAS_GIT":%s}\n' \
        "$branch_name" "$spec_file" "$feature_num" "$HAS_GIT"
else
    echo "BRANCH_NAME: $branch_name"
    echo "SPEC_FILE: $spec_file"
    echo "FEATURE_NUM: $feature_num"
    echo "HAS_GIT: $HAS_GIT"
    echo "SPECIFY_FEATURE environment variable set to: $branch_name"
fi
