/**
 * Copyright 2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var path = require("path");

var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();

var VCAP_APPLICATION = JSON.parse(process.env.VCAP_APPLICATION);
var VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);

var settings = module.exports = {
    uiPort: process.env.VCAP_APP_PORT || 1880,
    mqttReconnectTime: 15000,
    serialReconnectTime: 15000,
    debugMaxLength: 1000,

    // Add the bluemix-specific nodes in
    nodesDir: path.join(__dirname,"nodes"),

    // Blacklist the non-bluemix friendly nodes
    nodesExcludes:['66-mongodb.js','75-exec.js','35-arduino.js','36-rpi-gpio.js','25-serial.js','28-tail.js','50-file.js','31-tcpin.js','32-udp.js','23-watch.js'],

    // Enable module reinstalls on start-up; this ensures modules installed
    // post-deploy are restored after a restage
    autoInstallModules: true,

    // Move the admin UI
    httpAdminRoot: '/red',

    // You can protect the user interface with a userid and password by using the following property. 
    // Uncomment the following "adminAuth" property
    // the password must be an bcrypt hash  eg.. $2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN. ('password')
    adminAuth: {
             type: "credentials",
             users: [{
             username: "brendan",
             password: "$2a$10$u6JS2olNdIp.U4IfzTM7Ou8GO10JkEn9v8mC1IqEe1IWlqVCDab4e",
             permissions: "*"
          }],
    default: {
             permissions: "read"
          }
    },

    // Serve up the welcome page
    httpStatic: path.join(__dirname,"public"),

    functionGlobalContext: {
        jszlib:require('jszlib')
    },

    storageModule: require("./couchstorage")
};

settings.couchAppname = VCAP_APPLICATION['application_name'];


var storageServiceName = process.env.NODE_RED_STORAGE_NAME || new RegExp("^"+settings.couchAppname+".cloudantNoSQLDB");
var couchService = appEnv.getService(storageServiceName);

if (!couchService) {
    console.log("Failed to find Cloudant service");
    if (process.env.NODE_RED_STORAGE_NAME) {
        console.log(" - using NODE_RED_STORAGE_NAME environment variable: "+process.env.NODE_RED_STORAGE_NAME);
    }
    throw new Error("No cloudant service found");
}    
settings.couchUrl = couchService.credentials.url;


