Technologic Systems' Message Of The Day
==================
Collaboratively draw daily messages of the day.


Installation and usage
----------------------

Install required packages for node.js and npm install script
for Ubuntu 16.04.
::
    sudo apt-get install python-software-properties

Download and install setup script.
::
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

Clone the repository.
::
    git clone git@bitbucket.org:dhildreth/ts-motd.git

Prepare the application.
::
    cd ts-motd
    npm install
    npm install -g gulp
    gulp

Run the application.
::
    DEBUG=myapp:* npm start
