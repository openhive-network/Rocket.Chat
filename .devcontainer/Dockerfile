FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

SHELL ["/bin/bash", "-c"]

RUN <<-EOF
set -e
apt-get update
apt-get install -y g++ build-essential git curl
apt-get clean
rm -r /var/lib/apt/lists/*
EOF

USER vscode

RUN <<-EOF
set -e

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install 14.21.3
corepack enable
npm install -g meteor@2.16.0

mkdir -p /home/vscode/miniforge3
curl -fsSL "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh" -o /home/vscode/miniforge3/miniforge3.sh
bash /home/vscode/miniforge3/miniforge3.sh -b -u -p /home/vscode/miniforge3
rm /home/vscode/miniforge3/miniforge3.sh

source /home/vscode/miniforge3/bin/activate
conda init --all
conda create -n py310 python=3.10

echo "conda activate py310" >> /home/vscode/.bashrc

EOF