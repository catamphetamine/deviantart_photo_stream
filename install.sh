this_directory="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# https://github.com/joyent/node/wiki/installing-node.js-via-package-manager
apt-get install curl
curl -sL https://deb.nodesource.com/setup | bash -
apt-get update
apt-get install nodejs nodejs-legacy

# если не скачивается nodejs-legacy через apt-get, то можно руками:
# https://packages.debian.org/ru/sid/all/nodejs-legacy/download

npm install --global coffee-script
#npm install --global pm2

npm install
