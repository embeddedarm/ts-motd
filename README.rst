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
    sudo npm install -g gulp
    gulp

Run the application.
::
    DEBUG=myapp:* npm start

For running on production server, we'll use pm2 process manager.
::
    sudo npm install -g pm2

Then, we'll tell pm2 to start the application. 
::
    pm2 start ./bin/www -i 0 --name "ts-motd" --env "production"

Then, we'll setup pm2 to startup the program on startup.  Be sure to run the command it outputs.
::
    pm2 startup systemd
    sudo su -c "env PATH=$PATH:/usr/bin pm2 startup systemd -u derek --hp /home/derek"
    pm2 save