## Install from Github Workflow Artifacts

You need Github Personal Access Token, see
[docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
Export it as environment variable `GITHUB_TOKEN`. Then do something like this:

```bash
cd /tmp
mkdir -p rocket-chat-build
cd rocket-chat-build

# Github list artifacts and look for your artifacts id
curl \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/openhive-network/Rocket.Chat/actions/artifacts

# Or get artifact ID from Github UI, see example link from UI (artifact
# ID is the last part in URL):
# https://github.com/openhive-network/Rocket.Chat/suites/10616079470/artifacts/529787943

# Github download artifact
curl \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  --location --output rocket-chat-artifacts.zip \
  https://api.github.com/repos/openhive-network/Rocket.Chat/actions/artifacts/529787943/zip

# Later
unzip rocket-chat-artifacts.zip
rm rocket-chat-artifacts.zip
tar xzf Rocket.Chat.tar.gz
rm Rocket.Chat.tar.gz

# Follow https://docs.rocket.chat/deploy-rocket.chat/prepare-for-your-rocket.chat-deployment/other-deployment-methods/manual-installation/debian-based-distros/ubuntu
# to start Rocket Chat from terminal.

# Or copy or create correct Dockerfile alongside unpacked "bundle" directory.
# You can find correct Dockerfile in repository e.g. here:
# https://github.com/openhive-network/Rocket.Chat/blob/feat/allow-user-with-empty-email/apps/meteor/.docker/Dockerfile
# Then build docker image like this:
docker build -t wojtek/rocket-chat:4.8.7 .
```


## Syncing fork

See https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork#syncing-a-fork-branch-from-the-command-line

Prelimiray step (do once);
```bash
git remote add upstream git@github.com:RocketChat/Rocket.Chat.git ;
```

Usually we'll need to sync branch `master` – everything related to
releases is kept in this branch on upstream:
```bash
git checkout --track origin/master ;
git pull ;
git fetch upstream ;
git merge upstream/master ;
git push ;
```

## Applying Hive patch onto upstream release

Assuming you want to modify code in upstream release `5.4.3` and create
Hive release `5.4.3-hive.1`.

Fetch everything:
```bash
git fetch --all
```

Ensure that tag `5.4.3` exists:
```bash
git tag --list | grep 5.4.3
```
When this didn't find anything, something goes wrong. Maybe you need to
sync fork or the tag doesn't exist on remote.

See https://stackoverflow.com/a/29916361 or
https://womanonrails.com/git-rebase-onto to learn about `git rebase
--onto` quickly. We're going to do `git rebase --onto <newparent>
<oldparent> <until>`.

Get commit which tag `5.4.3` points to:
```bash
git rev-list -n 1 5.4.3
```
Note the output, e.g. `35705ae0928fde4d08e5156dbb61642577de28f0`. It's
our `newparent`.

Go to branch, where we have a code we want to apply:
```bash
git checkout release-5.4.2-hive.1
```

Identify the first (oldparent) and the last (until) commit you want to
apply. Note that `oldparent` won't be applied – it's the last common
commit. You can do this visually with gitk:
```bash
gitk &
```
![gitk](media/gitk-1.png "gitk")

In my case the first commit (oldparent) is
`35954af0a59f846bc7f15b475e281c69749190b8` (Bump version to 5.4.2), and
the last commit (until) is `c544ec7346f6a81a77832baca8803f99953a8e69`
(Improve docstring).

Do rebase:
```bash
git rebase --onto 35705ae0928fde4d08e5156dbb61642577de28f0 35954af0a59f846bc7f15b475e281c69749190b8 c544ec7346f6a81a77832baca8803f99953a8e69
```
Resolve merge conflicts, if any.

We're in detached HEAD now, so we need to create a new branch:
```bash
git checkout -b release-5.4.3-hive.1
```

Install yarn dependencies:
```bash
yarn install --frozen-lockfile
```
Test whether you can start application in development mode, and whether
you can confirm that our modifications behave as expected.

Reorganize commits, add new commits, if you need.

Bump version, when you're done. You need to modify following files (see
earlier commits doing similar thing):

- package.json
- apps/meteor/package.json
- apps/meteor/.docker/Dockerfile.rhel
- apps/meteor/app/utils/rocketchat.info

