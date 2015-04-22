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
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install build-essential subversion libjpeg8-dev imagemagick libv4l-0 libv4l-dev uvc dynctrl git-core

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
unzip mjpg-streamer-master.zip
cd mjpg-streamer-master/mjpg-streamer-experimental
make
sudo make install

################## System files ####################
#  Set up system files
sudo cat >>/boot/config.txt <<__EOF
# Turn off the camera LED
disable_camera_led=1

# Set 1-wire GPIO pin number
dtoverlay=w1-gpio,gpiopin=4
device_tree=
__EOF

sudo cat >>/etc/modules <<__EOF
snd-bcm2835
w1-gpio
w1-therm
bcm2835_v4l2
i2c-bcm2708
i2c-dev
__EOF

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


# Enable the camera
echo "**************************************"
echo " Now enable the camera in raspiconfig "
echo "**************************************"
read -p "Press ENTER to start ..."
sudo raspi-config
