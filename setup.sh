#!/bin/bash

# Variables - change them as you see fit
PROJECTNAME=beespi
PROJECTDIR=~/${PROJECTNAME}

# Location of files
GITFILES=`pwd`

# Create a directory called beespi & change to it
mkdir -p ${PROJECTDIR}
cd ${PROJECTDIR}

################## System ####################
# Update the system software
sudo apt-get -y update
sudo apt-get -y upgrade
sudo apt-get -y install build-essential subversion libjpeg8-dev imagemagick libv4l-0 libv4l-dev uvcdynctrl git-core libicu-dev cmake

################## Node & Node-RED ####################
# Get NODE
wget http://node-arm.herokuapp.com/node_0.10.36_armhf.deb
sudo dpkg -i node_0.10.36_armhf.deb

# Install node-red
sudo npm install -g --unsafe-perm  node-red

################## WiringPi ####################
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build

################## bcm2835 ####################
cd ${PROJECTDIR}
wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.36.tar.gz
tar zxvf bcm2835-1.36.tar.gz
cd bcm2835-1.36
./configure
make
sudo make check
sudo make install

################## mjpg-streamer ####################
cd ${PROJECTDIR}
# Download the mjpg-streamer code
svn co https://svn.code.sf.net/p/mjpg-streamer/code/mjpg-streamer/ mjpg-streamer

# Build mjpg-streamer
cd mjpg-streamer
make USE_LIBV4L2=true clean all
sudo make install

# Get the Raspberry Pi extensions for mjpg-streamer
cd ${PROJECTDIR}
wget https://github.com/jacksonliam/mjpg-streamer/archive/master.zip
unzip master.zip
cd mjpg-streamer-master/mjpg-streamer-experimental
make
sudo make install


################## Scripts ####################
# Set up startup scripts
sudo cp ${GITFILES}/node-redd /etc/init.d
sudo chmod +x /etc/init.d/node-redd
sudo update-rc.d node-redd defaults
sudo cp ${GITFILES}/mjpg-streamerd /etc/init.d
sudo chmod +x /etc/init.d/mjpg-streamerd
sudo update-rc.d mjpg-streamerd defaults

# Set up the node-red extras
sudo ${GITFILES}/setuproot.sh

