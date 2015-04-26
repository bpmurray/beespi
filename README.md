# Beespi Installation
This is a script to help you install [beespi](http://beespi.mybluemix.net)
dependencies. It assumes that you've set up your Raspberry Pi to your liking.
The script updates the OS and installs the various drivers you need, including
* [WiringPi](http://wiringpi.com/)
* [Mjpg-Streamer](http://sourceforge.net/projects/mjpg-streamer/) and the [Raspberry extensions](https://github.com/jacksonliam/mjpg-streamer)
* [node.js](https://nodejs.org/)
* [Node Red](http://nodered.org/)
* The beespi Node-RED flow

# System files
Make the following changes to system files, i.e. make sure these lines
are present:
* /boot/config.txt
  * # Turn off the camera LED
  * disable_camera_led=1
  * # Set 1-wire GPIO pin number
  * dtoverlay=w1-gpio,gpiopin=4
  * device_tree=
* /etc/modules (the order is important)
  * snd-bcm2835
  * w1-gpio
  * w1-therm
  * bcm2835_v4l2
  * i2c-bcm2708
  * i2c-dev
* /etc/modprobe.d/raspi-blacklist.conf (create the file if it doesn't exist)
  * blacklist snd-soc-pcm512x
  * blacklist snd-soc-wm8804
