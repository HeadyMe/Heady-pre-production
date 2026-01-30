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

if [ "$CHANGED_COUNT" -eq "0" ]; then
    echo "No local changes detected. Checking for remote updates..."
    git pull origin $BRANCH --rebase
    exit 0
fi

# Generate a summary of what changed (e.g., "Updated 5 files: server.js, ...")
FILES=$(git status --porcelain | awk '{print $2}' | tr '\n' ',' | sed 's/,$//')
COMMIT_MSG="HeadyHive Evolution [$TIMESTAMP]: Updates to $FILES"

echo -e "\033[0;33m[SCAN] Detected changes in $CHANGED_COUNT files.\033[0m"

# 2. STAGE
git add .

# 3. SAFE REBASE (The "Squash Merge" Logic)
# We pull changes. If histories are unrelated, we allow it.
# We prefer local changes (-X ours) during rebase conflicts because 
# your local HeadyHive build is the Source of Truth.
echo "[SYNC] Aligning with remote..."
git pull origin $BRANCH --rebase --strategy-option=theirs --allow-unrelated-histories

# 4. COMMIT
echo "[COMMIT] Stamping version..."
git commit -m "$COMMIT_MSG"

# 5. PUSH
echo "[UPLINK] Pushing to GitHub..."
git push origin $BRANCH

if [ $? -eq 0 ]; then
    echo -e "\n\033[0;32m[SUCCESS] Repository Synchronized.\033[0m"
else
    echo -e "\n\033[0;31m[ERROR] Push rejected. You may need to Force Push if histories are incompatible.\033[0m"
    echo "Run: git push origin $BRANCH --force"
fi
