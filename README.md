# homebridge-filebased-watersensor
A filebased leak sensor for Homebridge

This plugin sensor monitors the modification time of an "leak file" and a "noleak file" to determine the state of a leak sensor.

For background, this is my way of kludging together integration of a yolink door sensors into homekit.

My particular setup relies on several interconnected components:

1.  Yolink Door sensors https://shop.yosmart.com/collections/featured/products/outdoor-contact-sensor
2.  IFTTT recipes that connects with yolink.  I append to an open or closed file hosted on dropbox  when receiving the corresponding event from yolink.  
3.  Synology Cloudsync synchronizing my dropbox account
4.  Homebridge running as a docker container on a Synology NAS.  I present the synchronized dropbox folder to the docker container
5.  Finally this plugin


Configure the plugin as follows:


      {
            "name": "Dishwasher ",
            "leakpath": "/yolink/devices/leaksensor/wet.txt",
            "noleakpath": "/yolink/devices/leaksensor/dry.txt",
            "accessory": "LeakSensor"
        }
        
        
The logic works as follows:

  * If neither the leakpath nor noleakpath file exist, then the sensor is dry
  * If only the leakpath file exists, then the sensor is wet
  * If only the noleakpath file exists, then the sensor is dry
  * If both files exist, then compare the last modification time.  The most recently modified file reflects the current state of the sensor.

I poll the status of the files every 1/2 second.

--

Lots of improvements to make, especially around building the config properly.  

Enjoy. 


