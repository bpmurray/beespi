#!/bin/bash
# Setup the node-red files
mkdir -p /root/.node-red
cd /root/.node-red
npm install --unsafe-perm node-red-contrib-dht-sensor node-red-contrib-ds18b20-sensor
cd ..
chown -R root:root .node-red
