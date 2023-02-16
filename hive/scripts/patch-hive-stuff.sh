#!/usr/bin/env bash

#
# Script prints a git command for applying range of commits with our
# code, onto `master` branch at specific commit. See [answer by Enrico
# Campidoglio](https://stackoverflow.com/a/29916361) or [article by
# Agnieszka Małaszkiewicz](https://womanonrails.com/git-rebase-onto) to
# learn about `git rebase --onto` quickly. We're going to do `git rebase
# --onto <newparent> <oldparent> <until>`. Example run:
# ```
# TAG="6.4.1" BRANCH="hive-6.3.7" ./hive/scripts/patch-hive-stuff.sh
# ```
#

set -euo pipefail

TAG="${1:-$TAG}"
BRANCH="${1:-$BRANCH}"

NEWPARENT="$(git rev-list -n 1 ${TAG})"
OLDPARENT="$(git merge-base master ${BRANCH})"
UNTIL="$(git rev-parse ${BRANCH})"

echo "NEWPARENT: ${NEWPARENT}"
echo "OLDPARENT: ${OLDPARENT}"
echo "UNTIL: ${UNTIL}"
echo "COMMAND: git rebase --onto ${NEWPARENT} ${OLDPARENT} ${UNTIL}"
