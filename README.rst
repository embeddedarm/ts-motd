Technologic Systems' Message Of The Day
==================
Collaboratively draw daily messages of the day.


Installation and usage
----------------------

::

    sudo apt-get install nodejs pkg-config libcairo2-dev libjpeg-dev libgif-dev
    git clone git@bitbucket.org:dhildreth/ts-motd.git
    cd ts-motd
    npm install
    gulp
    cp settings.json.example settings.json
    node app.js
    # Happy drawing!

You may need to update nodejs and/or npm.

NPM:
    curl -L https://www.npmjs.com/install.sh | sh

NVM:
Node.js version manager script from https://github.com/creationix/nvm.

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.6/install.sh | bash

