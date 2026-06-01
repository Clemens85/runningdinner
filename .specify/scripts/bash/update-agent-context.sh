#!/usr/bin/env bash
# Update agent context files with information from plan.md
#
# Usage: ./update-agent-context.sh [agent-type]
#
# agent-type: claude|gemini|copilot|cursor-agent|qwen|opencode|codex|windsurf|
#             kilocode|auggie|roo|codebuddy|amp|shai|q|agy|bob|qodercli|generic
# If omitted, all existing agent files are updated (Claude created if none exist).

set -e

AGENT_TYPE="${1:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

get_feature_paths

# ── agent file paths ──────────────────────────────────────────────────────────

CLAUDE_FILE="$REPO_ROOT/CLAUDE.md"
GEMINI_FILE="$REPO_ROOT/GEMINI.md"
COPILOT_FILE="$REPO_ROOT/.github/agents/copilot-instructions.md"
CURSOR_FILE="$REPO_ROOT/.cursor/rules/specify-rules.mdc"
QWEN_FILE="$REPO_ROOT/QWEN.md"
AGENTS_FILE="$REPO_ROOT/AGENTS.md"
WINDSURF_FILE="$REPO_ROOT/.windsurf/rules/specify-rules.md"
KILOCODE_FILE="$REPO_ROOT/.kilocode/rules/specify-rules.md"
AUGGIE_FILE="$REPO_ROOT/.augment/rules/specify-rules.md"
ROO_FILE="$REPO_ROOT/.roo/rules/specify-rules.md"
CODEBUDDY_FILE="$REPO_ROOT/CODEBUDDY.md"
QODER_FILE="$REPO_ROOT/QODER.md"
SHAI_FILE="$REPO_ROOT/SHAI.md"
AGY_FILE="$REPO_ROOT/.agent/rules/specify-rules.md"
TEMPLATE_FILE="$REPO_ROOT/.specify/templates/agent-file-template.md"
NEW_PLAN="$IMPL_PLAN"

# Parsed plan data (populated by parse_plan_data)
NEW_LANG=""
NEW_FRAMEWORK=""
NEW_DB=""
NEW_PROJECT_TYPE=""

# ── logging helpers ───────────────────────────────────────────────────────────

write_info()    { echo "INFO: $1"; }
write_success() { echo "✓ $1"; }
write_warning() { echo "WARNING: $1" >&2; }
write_err()     { echo "ERROR: $1" >&2; }

# ── environment validation ────────────────────────────────────────────────────

validate_environment() {
    if [ -z "$CURRENT_BRANCH" ]; then
        write_err "Unable to determine current feature"
        if [ "$HAS_GIT" = "true" ]; then
            write_info "Make sure you're on a feature branch"
        else
            write_info "Set SPECIFY_FEATURE environment variable or create a feature first"
        fi
        exit 1
    fi
    if [ ! -f "$NEW_PLAN" ]; then
        write_err "No plan.md found at $NEW_PLAN"
        write_info "Ensure you are working on a feature with a corresponding spec directory"
        exit 1
    fi
    if [ ! -f "$TEMPLATE_FILE" ]; then
        write_err "Template file not found at $TEMPLATE_FILE"
        write_info "Run specify init to scaffold .specify/templates, or add agent-file-template.md there."
        exit 1
    fi
}

# ── plan parsing ──────────────────────────────────────────────────────────────

extract_plan_field() {
    local field_pattern="$1"
    local plan_file="$2"
    [ ! -f "$plan_file" ] && return
    grep -m 1 "^\*\*${field_pattern}\*\*: " "$plan_file" 2>/dev/null \
        | sed "s/^\*\*${field_pattern}\*\*: //" \
        | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' \
        | grep -v '^NEEDS CLARIFICATION$' \
        | grep -v '^N/A$' \
        || true
}

parse_plan_data() {
    local plan_file="$1"
    if [ ! -f "$plan_file" ]; then
        write_err "Plan file not found: $plan_file"
        return 1
    fi
    write_info "Parsing plan data from $plan_file"
    NEW_LANG=$(extract_plan_field 'Language/Version'      "$plan_file")
    NEW_FRAMEWORK=$(extract_plan_field 'Primary Dependencies' "$plan_file")
    NEW_DB=$(extract_plan_field 'Storage'                 "$plan_file")
    NEW_PROJECT_TYPE=$(extract_plan_field 'Project Type'  "$plan_file")

    [ -n "$NEW_LANG" ]         && write_info "Found language: $NEW_LANG"      || write_warning "No language information found in plan"
    [ -n "$NEW_FRAMEWORK" ]    && write_info "Found framework: $NEW_FRAMEWORK"
    [ -n "$NEW_DB" ] && [ "$NEW_DB" != "N/A" ] && write_info "Found database: $NEW_DB"
    [ -n "$NEW_PROJECT_TYPE" ] && write_info "Found project type: $NEW_PROJECT_TYPE"
    return 0
}

# ── content helpers ───────────────────────────────────────────────────────────

format_technology_stack() {
    local lang="$1" framework="$2"
    local parts=()
    [ -n "$lang" ]      && [ "$lang" != "NEEDS CLARIFICATION" ] && parts+=("$lang")
    [ -n "$framework" ] && [ "$framework" != "NEEDS CLARIFICATION" ] && [ "$framework" != "N/A" ] && parts+=("$framework")
    [ "${#parts[@]}" -eq 0 ] && return
    local IFS=' + '
    echo "${parts[*]}"
}

# ── agent file creation / update (Python for multi-line safe text substitution) ──

new_agent_file() {
    local target_file="$1"
    local project_name="$2"
    local date="$3"

    [ ! -f "$TEMPLATE_FILE" ] && { write_err "Template not found at $TEMPLATE_FILE"; return 1; }

    local tech_stack_entry=""
    if [ -n "$NEW_LANG" ] && [ -n "$NEW_FRAMEWORK" ]; then
        tech_stack_entry="- $NEW_LANG + $NEW_FRAMEWORK ($CURRENT_BRANCH)"
    elif [ -n "$NEW_LANG" ]; then
        tech_stack_entry="- $NEW_LANG ($CURRENT_BRANCH)"
    elif [ -n "$NEW_FRAMEWORK" ]; then
        tech_stack_entry="- $NEW_FRAMEWORK ($CURRENT_BRANCH)"
    fi

    local recent_changes_entry=""
    if [ -n "$NEW_LANG" ] && [ -n "$NEW_FRAMEWORK" ]; then
        recent_changes_entry="- ${CURRENT_BRANCH}: Added ${NEW_LANG} + ${NEW_FRAMEWORK}"
    elif [ -n "$NEW_LANG" ]; then
        recent_changes_entry="- ${CURRENT_BRANCH}: Added ${NEW_LANG}"
    elif [ -n "$NEW_FRAMEWORK" ]; then
        recent_changes_entry="- ${CURRENT_BRANCH}: Added ${NEW_FRAMEWORK}"
    fi

    mkdir -p "$(dirname "$target_file")"

    # Use Python for safe multi-line substitution
    SPECIFY_PROJECT_NAME="$project_name" \
    SPECIFY_DATE="$date" \
    SPECIFY_TECH_STACK="$tech_stack_entry" \
    SPECIFY_LANG="$NEW_LANG" \
    SPECIFY_PROJECT_TYPE="$NEW_PROJECT_TYPE" \
    SPECIFY_COMMANDS_HINT="$NEW_LANG" \
    SPECIFY_RECENT_CHANGES="$recent_changes_entry" \
    SPECIFY_TEMPLATE="$TEMPLATE_FILE" \
    SPECIFY_TARGET="$target_file" \
    python3 - <<'PYEOF'
import os, re

template_path = os.environ["SPECIFY_TEMPLATE"]
target_path   = os.environ["SPECIFY_TARGET"]
project_name  = os.environ["SPECIFY_PROJECT_NAME"]
date          = os.environ["SPECIFY_DATE"]
tech_stack    = os.environ["SPECIFY_TECH_STACK"]
lang          = os.environ.get("SPECIFY_LANG", "")
project_type  = os.environ.get("SPECIFY_PROJECT_TYPE", "")
recent_changes = os.environ["SPECIFY_RECENT_CHANGES"]

def get_project_structure(pt):
    if "web" in pt.lower():
        return "backend/\nfrontend/\ntests/"
    return "src/\ntests/"

def get_commands(l):
    if "Python" in l:   return "cd src; pytest; ruff check ."
    if "Rust" in l:     return "cargo test; cargo clippy"
    if "JavaScript" in l or "TypeScript" in l: return "npm test; npm run lint"
    return f"# Add commands for {l}" if l else "# Add build/test commands here"

def get_conventions(l):
    return f"{l}: Follow standard conventions" if l else "General: Follow standard conventions"

with open(template_path, encoding="utf-8") as f:
    content = f.read()

content = content.replace("[PROJECT NAME]",                         project_name)
content = content.replace("[DATE]",                                 date)
content = content.replace("[EXTRACTED FROM ALL PLAN.MD FILES]",     tech_stack)
content = content.replace("[ACTUAL STRUCTURE FROM PLANS]",          get_project_structure(project_type))
content = content.replace("[ONLY COMMANDS FOR ACTIVE TECHNOLOGIES]",get_commands(lang))
content = content.replace("[LANGUAGE-SPECIFIC, ONLY FOR LANGUAGES IN USE]", get_conventions(lang))
content = content.replace("[LAST 3 FEATURES AND WHAT THEY ADDED]",  recent_changes)

with open(target_path, "w", encoding="utf-8") as f:
    f.write(content)
PYEOF
    return 0
}

update_existing_agent_file() {
    local target_file="$1"
    local date="$2"

    if [ ! -f "$target_file" ]; then
        new_agent_file "$target_file" "$(basename "$REPO_ROOT")" "$date"
        return $?
    fi

    local tech_stack
    tech_stack=$(format_technology_stack "$NEW_LANG" "$NEW_FRAMEWORK")

    # Collect new tech entries
    local new_tech_json="[]"
    local entries_py=""
    if [ -n "$tech_stack" ] && ! grep -qF "$tech_stack" "$target_file"; then
        entries_py+="\"- $tech_stack ($CURRENT_BRANCH)\","
    fi
    if [ -n "$NEW_DB" ] && [ "$NEW_DB" != "N/A" ] && [ "$NEW_DB" != "NEEDS CLARIFICATION" ]; then
        if ! grep -qF "$NEW_DB" "$target_file"; then
            entries_py+="\"- $NEW_DB ($CURRENT_BRANCH)\","
        fi
    fi
    # Trim trailing comma
    entries_py="${entries_py%,}"

    local new_change_entry=""
    if [ -n "$tech_stack" ]; then
        new_change_entry="- ${CURRENT_BRANCH}: Added ${tech_stack}"
    elif [ -n "$NEW_DB" ] && [ "$NEW_DB" != "N/A" ] && [ "$NEW_DB" != "NEEDS CLARIFICATION" ]; then
        new_change_entry="- ${CURRENT_BRANCH}: Added ${NEW_DB}"
    fi

    SPECIFY_TARGET="$target_file" \
    SPECIFY_DATE="$date" \
    SPECIFY_CURRENT_BRANCH="$CURRENT_BRANCH" \
    SPECIFY_NEW_TECH_ENTRIES="[$entries_py]" \
    SPECIFY_NEW_CHANGE_ENTRY="$new_change_entry" \
    python3 - <<'PYEOF'
import os, re, json

target_file   = os.environ["SPECIFY_TARGET"]
date          = os.environ["SPECIFY_DATE"]
current_branch = os.environ["SPECIFY_CURRENT_BRANCH"]
new_tech_entries = json.loads(os.environ["SPECIFY_NEW_TECH_ENTRIES"])
new_change_entry = os.environ.get("SPECIFY_NEW_CHANGE_ENTRY", "")

with open(target_file, encoding="utf-8") as f:
    lines = f.read().splitlines()

output = []
in_tech = False
in_changes = False
tech_added = False
change_added = False
existing_changes = 0

for line in lines:
    if line == "## Active Technologies":
        output.append(line)
        in_tech = True
        continue
    if in_tech and line.startswith("## "):
        if not tech_added and new_tech_entries:
            output.extend(new_tech_entries)
            tech_added = True
        output.append(line)
        in_tech = False
        continue
    if in_tech and not line.strip():
        if not tech_added and new_tech_entries:
            output.extend(new_tech_entries)
            tech_added = True
        output.append(line)
        continue
    if line == "## Recent Changes":
        output.append(line)
        if new_change_entry:
            output.append(new_change_entry)
            change_added = True
        in_changes = True
        continue
    if in_changes and line.startswith("## "):
        output.append(line)
        in_changes = False
        continue
    if in_changes and line.startswith("- "):
        if existing_changes < 2:
            output.append(line)
            existing_changes += 1
        continue
    if re.search(r"\*\*Last updated\*\*: .*\d{4}-\d{2}-\d{2}", line):
        output.append(re.sub(r"\d{4}-\d{2}-\d{2}", date, line))
        continue
    output.append(line)

# Flush pending tech entries if section ended at EOF
if in_tech and not tech_added and new_tech_entries:
    output.extend(new_tech_entries)

with open(target_file, "w", encoding="utf-8") as f:
    f.write("\n".join(output) + "\n")
PYEOF
    return 0
}

update_agent_file() {
    local target_file="$1"
    local agent_name="$2"

    write_info "Updating $agent_name context file: $target_file"
    local project_name date
    project_name=$(basename "$REPO_ROOT")
    date=$(date '+%Y-%m-%d')

    mkdir -p "$(dirname "$target_file")"

    if [ ! -f "$target_file" ]; then
        if new_agent_file "$target_file" "$project_name" "$date"; then
            write_success "Created new $agent_name context file"
        else
            write_err "Failed to create new agent file"
            return 1
        fi
    else
        if update_existing_agent_file "$target_file" "$date"; then
            write_success "Updated existing $agent_name context file"
        else
            write_err "Failed to update agent file"
            return 1
        fi
    fi
    return 0
}

# ── dispatch ──────────────────────────────────────────────────────────────────

update_specific_agent() {
    local type="$1"
    case "$type" in
        claude)        update_agent_file "$CLAUDE_FILE"     "Claude Code" ;;
        gemini)        update_agent_file "$GEMINI_FILE"     "Gemini CLI" ;;
        copilot)       update_agent_file "$COPILOT_FILE"    "GitHub Copilot" ;;
        cursor-agent)  update_agent_file "$CURSOR_FILE"     "Cursor IDE" ;;
        qwen)          update_agent_file "$QWEN_FILE"       "Qwen Code" ;;
        opencode)      update_agent_file "$AGENTS_FILE"     "opencode" ;;
        codex)         update_agent_file "$AGENTS_FILE"     "Codex CLI" ;;
        windsurf)      update_agent_file "$WINDSURF_FILE"   "Windsurf" ;;
        kilocode)      update_agent_file "$KILOCODE_FILE"   "Kilo Code" ;;
        auggie)        update_agent_file "$AUGGIE_FILE"     "Auggie CLI" ;;
        roo)           update_agent_file "$ROO_FILE"        "Roo Code" ;;
        codebuddy)     update_agent_file "$CODEBUDDY_FILE"  "CodeBuddy CLI" ;;
        qodercli)      update_agent_file "$QODER_FILE"      "Qoder CLI" ;;
        amp)           update_agent_file "$AGENTS_FILE"     "Amp" ;;
        shai)          update_agent_file "$SHAI_FILE"       "SHAI" ;;
        q)             update_agent_file "$AGENTS_FILE"     "Amazon Q Developer CLI" ;;
        agy)           update_agent_file "$AGY_FILE"        "Antigravity" ;;
        bob)           update_agent_file "$AGENTS_FILE"     "IBM Bob" ;;
        generic)       write_info "Generic agent: no predefined context file." ;;
        *)             write_err "Unknown agent type '$type'"; return 1 ;;
    esac
}

update_all_existing_agents() {
    local found=false ok=true
    [ -f "$CLAUDE_FILE" ]    && { update_agent_file "$CLAUDE_FILE"    "Claude Code"     || ok=false; found=true; }
    [ -f "$GEMINI_FILE" ]    && { update_agent_file "$GEMINI_FILE"    "Gemini CLI"      || ok=false; found=true; }
    [ -f "$COPILOT_FILE" ]   && { update_agent_file "$COPILOT_FILE"   "GitHub Copilot"  || ok=false; found=true; }
    [ -f "$CURSOR_FILE" ]    && { update_agent_file "$CURSOR_FILE"    "Cursor IDE"      || ok=false; found=true; }
    [ -f "$QWEN_FILE" ]      && { update_agent_file "$QWEN_FILE"      "Qwen Code"       || ok=false; found=true; }
    [ -f "$AGENTS_FILE" ]    && { update_agent_file "$AGENTS_FILE"    "Codex/opencode"  || ok=false; found=true; }
    [ -f "$WINDSURF_FILE" ]  && { update_agent_file "$WINDSURF_FILE"  "Windsurf"        || ok=false; found=true; }
    [ -f "$KILOCODE_FILE" ]  && { update_agent_file "$KILOCODE_FILE"  "Kilo Code"       || ok=false; found=true; }
    [ -f "$AUGGIE_FILE" ]    && { update_agent_file "$AUGGIE_FILE"    "Auggie CLI"      || ok=false; found=true; }
    [ -f "$ROO_FILE" ]       && { update_agent_file "$ROO_FILE"       "Roo Code"        || ok=false; found=true; }
    [ -f "$CODEBUDDY_FILE" ] && { update_agent_file "$CODEBUDDY_FILE" "CodeBuddy CLI"   || ok=false; found=true; }
    [ -f "$QODER_FILE" ]     && { update_agent_file "$QODER_FILE"     "Qoder CLI"       || ok=false; found=true; }
    [ -f "$SHAI_FILE" ]      && { update_agent_file "$SHAI_FILE"      "SHAI"            || ok=false; found=true; }
    [ -f "$AGY_FILE" ]       && { update_agent_file "$AGY_FILE"       "Antigravity"     || ok=false; found=true; }

    if [ "$found" = false ]; then
        write_info "No existing agent files found, creating default Claude file..."
        update_agent_file "$CLAUDE_FILE" "Claude Code" || ok=false
    fi
    [ "$ok" = true ]
}

print_summary() {
    echo ""
    write_info "Summary of changes:"
    [ -n "$NEW_LANG" ]      && echo "  - Added language: $NEW_LANG"
    [ -n "$NEW_FRAMEWORK" ] && echo "  - Added framework: $NEW_FRAMEWORK"
    [ -n "$NEW_DB" ] && [ "$NEW_DB" != "N/A" ] && echo "  - Added database: $NEW_DB"
    echo ""
    write_info "Usage: ./update-agent-context.sh [claude|gemini|copilot|cursor-agent|qwen|opencode|codex|windsurf|kilocode|auggie|roo|codebuddy|amp|shai|q|agy|bob|qodercli|generic]"
}

# ── entry point ───────────────────────────────────────────────────────────────

main() {
    validate_environment
    write_info "=== Updating agent context files for feature $CURRENT_BRANCH ==="

    if ! parse_plan_data "$NEW_PLAN"; then
        write_err "Failed to parse plan data"
        exit 1
    fi

    local success=true
    if [ -n "$AGENT_TYPE" ]; then
        write_info "Updating specific agent: $AGENT_TYPE"
        update_specific_agent "$AGENT_TYPE" || success=false
    else
        write_info "No agent specified, updating all existing agent files..."
        update_all_existing_agents || success=false
    fi

    print_summary

    if [ "$success" = true ]; then
        write_success "Agent context update completed successfully"
        exit 0
    else
        write_err "Agent context update completed with errors"
        exit 1
    fi
}

main
