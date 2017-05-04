This project uses [Node-RED](http://nodered.org/) on a [Raspberry Pi](https://www.raspberrypi.org/) to capture data
from [DS18B20](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-11-ds18b20-temperature-sensing/hardware)
and [DHT22](https://learn.adafruit.com/dht/overview) sensors, uploading the
readings to BlueMix via the [IBM Internet of Things Foundation](https://internetofthings.ibmcloud.com/) (IoT).
These data are then captured in another Node-RED flow on Bluemix, and stored in a
[MongoDB](https://www.mongodb.org/) database.

There are three REST entry points, also defined in Node-RED:
*  Returning the [temperature](http://beespi.mybluemix.net/temperature) data to the web page
*  Returning the [humidity](http://beespi.mybluemix.net/humidity) data to the web page
*  Retrieving the current [ambient temperature](http://beespi.mybluemix.net/external) from the Raspberry Pi

This code is licensed under the Apache 2.0 licence, as documented in the License.txt file.