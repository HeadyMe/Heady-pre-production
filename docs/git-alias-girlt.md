# Heady Git Alias Setup

To add the 'girlt' alias for the squash workflow, add the following to your ~/.gitconfig file:

[alias]
    girlt = "!git reset $(git merge-base main $(git rev-parse --abbrev-ref HEAD)) --soft && git add . && git commit -e -m 'feat: combined changes from dev branch' && git push --force-with-lease"

# Usage:
#   git girlt
# This will squash all changes since main, commit, and push with force-with-lease.
