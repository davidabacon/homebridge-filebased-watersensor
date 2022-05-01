var Service;
var Characteristic;
var LeakState;
var crypto = require("crypto");
var fs = require('fs');
var sn = "12345";

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    LeakState = homebridge.hap.Characteristic.LeakDetected;
    homebridge.registerAccessory("homebridge-filebased-watersensor", "LeakSensor", LeakSensorAccessory);

};
//constructor function

function LeakSensorAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.leakfilepath = config["leakpath"];
  this.noleakfilepath = config["noleakpath"];
  this.sensorPollInMs = 500;

  if(config["sn"]){
      this.sn = config["sn"];
  } else {
      var shasum = crypto.createHash('sha1');
      shasum.update(this.leakfilepath);
      this.sn = shasum.digest('base64');
      this.log('Computed SN ' + this.sn);
      this.log('Leak File ' + this.leakfilepath );
      this.log('No Leak File ' + this.noleakfilepath);
  }

  this.isWet = false;
  this.service = new Service.LeakSensor(this.name);
  setTimeout(this.monitorLeakState.bind(this), this.sensorPollInMs);
}

LeakSensorAccessory.prototype = {

    identify: function(callback) {
        this.log("Identify requested");
        callback(null);
    },

    monitorLeakState: function() {
        this.LeakDetected = this.isWet();
        this.service.getCharacteristic(Characteristic.LeakDetected).setValue(this.LeakDetected);
        setTimeout(this.monitorLeakState.bind(this), this.sensorPollInMs);
    },

    isWet: function() {
//        this.log("dry file path", this.noleakfilepath);
        if (!fs.existsSync(this.noleakfilepath) && !fs.existsSync(this.leakfilepath)) {
//            this.log('Neither leak or noleak file exists, sensor is dry');
            return false;
        } else {
            if (!fs.existsSync(this.leakfilepath)) {
//                this.log('There is no leak file, so sensor is dry');
                return false;
            }else {
                var statsLeak = fs.statSync(this.leakfilepath);
                var statsNoLeak = fs.statSync(this.noleakfilepath);
//                this.log('dry file mod time is ' + statsClosed.mtime);
//                this.log('leak file mod time is ' + statsOpen.mtime);
                if (statsNoLeak.mtime <= statsLeak.mtime) {
//                        this.log('NoLeak file is older than Leak file, sensor is wet');
                        return true;
                } else {
//                    this.log('NoLeak file is newer than leak file, the sensor is dry');
                    return false;
                }
            }
        }
    },

    getLeakSensorState: function(callback) {
        this.LeakDetected = this.isWet();
 //       this.log("getLeakSensor state: ", this.LeakDetected);
        callback(null,this.LeakDetected);
    },

    getName: function(callback) {
        this.log("getName :", this.name);
        callback(null, this.name);
    },

    getServices: function() {
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, "Homebridge")
      .setCharacteristic(Characteristic.Model, "Leak Sensor")
      .setCharacteristic(Characteristic.SerialNumber, this.sn);

      this.service
            .getCharacteristic(Characteristic.LeakDetected)
            .on('get', this.getLeakSensorState.bind(this));

        this.service
            .getCharacteristic(Characteristic.Name)
            .on('get', this.getName.bind(this));

        return [informationService, this.service];
  }
};