#!/bin/bash

# Variables - change them as you see fit
PROJECTNAME=beespi
PROJECTDIR=~/${PROJECTNAME}

# Create a directory called beespi & change to it
mkdir -p ${PROJECTDIR}
cd ${PROJECTDIR}

# Update the system software
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install build-essential subversion libjpeg8-dev imagemagick libv4l-0 libv4l-dev uvc dynctrl

# Get NODE
wget http://node-arm.herokuapp.com/node_0.10.36_armhf.deb
sudo dpkg -i node_0.10.36_armhf.deb

# Install node-red
sudo npm install -g --unsafe-perm  node-red

# Download the mjpg-streamer code
svn co https://svn.code.sf.net/p/mjpg-streamer/code/mjpg-streamer/ mjpg-streamer


 node-red-contrib-dht-sensor
 node-red-contrib-ds18b20-sensor

# Build mjpg-streamer
cd mjpg-streamer
make USE_LIBV4L2=true clean all
sudo make install

# Get the Raspberry Pi extensions for mjpg-streamer
cd ${PROJECTDIR}
wget https://github.com/jacksonliam/mjpg-streamer/archive/master.zip
unzip mjpg-streamer-master.zip
cd mjpg-streamer-master/mjpg-streamer-experimental
make
sudo make install
