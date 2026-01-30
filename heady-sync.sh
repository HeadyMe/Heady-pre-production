#!/bin/bash

# ==============================================================================
# HEADY PROTOCOL: SMART SYNC & SQUASH
# ------------------------------------------------------------------------------
# 1. Scans for changes.
# 2. Pulls remote DNA to ensure history alignment.
# 3. Squashes local work into a single "Evolution" commit.
# 4. Pushes to cloud.
# ==============================================================================

BRANCH="main"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo -e "\033[0;36m[HEADY] Initiating Repository Synchronization...\033[0m"

# 1. INTELLIGENT SCAN (Generate Commit Message based on files)
# We count changed files to make the message descriptive
CHANGED_COUNT=$(git status --porcelain | wc -l)

if [ "$CHANGED_COUNT" -eq 0 ]; then
    echo "No local changes detected. Checking for remote updates..."
    git pull origin "$BRANCH" --rebase
    exit 0
fi

# Generate a summary of what changed (e.g., "Updated 5 files: server.js, ...")
# Use cut to properly handle filenames with spaces
FILES=$(git status --porcelain | cut -c4- | head -10 | tr '\n' ',' | sed 's/,$//')
FILE_COUNT=$(git status --porcelain | wc -l)

# Truncate file list if too many files changed
if [ "$FILE_COUNT" -gt 10 ]; then
    COMMIT_MSG="HeadyHive Evolution [$TIMESTAMP]: Updates to $FILES and $((FILE_COUNT - 10)) more files"
else
    COMMIT_MSG="HeadyHive Evolution [$TIMESTAMP]: Updates to $FILES"
fi

echo -e "\033[0;33m[SCAN] Detected changes in $CHANGED_COUNT files.\033[0m"
echo -e "\033[0;33m[WARNING] Ensure .gitignore properly excludes sensitive files before proceeding.\033[0m"

# 2. STAGE
echo "[STAGE] Staging changes..."
if ! git add .; then
    echo -e "\033[0;31m[ERROR] Failed to stage changes.\033[0m"
    exit 1
fi

# 3. COMMIT LOCAL CHANGES
echo "[COMMIT] Creating local commit..."
if ! git commit -m "$COMMIT_MSG"; then
    echo -e "\033[0;31m[ERROR] Failed to commit changes.\033[0m"
    exit 1
fi

# 4. SAFE SYNC WITH REMOTE
# Pull remote changes and rebase our local commit on top
echo "[SYNC] Aligning with remote..."
if ! git pull origin "$BRANCH" --rebase --allow-unrelated-histories; then
    echo -e "\033[0;31m[ERROR] Rebase failed. You may have conflicts to resolve.\033[0m"
    echo "Resolve conflicts, then run:"
    echo "  git rebase --continue"
    echo "  git push origin \"$BRANCH\""
    exit 1
fi

# 5. PUSH
echo "[UPLINK] Pushing to GitHub..."
if git push origin "$BRANCH"; then
    echo -e "\n\033[0;32m[SUCCESS] Repository Synchronized.\033[0m"
else
    echo -e "\n\033[0;31m[ERROR] Push rejected.\033[0m"
    echo "This usually means someone else pushed changes. Try:"
    echo "  git pull origin \"$BRANCH\" --rebase"
    echo "  git push origin \"$BRANCH\""
    echo ""
    echo "Only use force push if you're certain you want to overwrite remote:"
    echo "  git push origin \"$BRANCH\" --force-with-lease"
    exit 1
fi
