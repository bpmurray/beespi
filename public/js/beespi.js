//  678C8B060000 - H06 super
//  1BE4FA050000 - H06 brood
//  DHT2201      - H06 crown
//  BD27FB050000 - H01 super
//  71EEFA050000 - H01 brood
//  DHT2202      - H01 crown
//  8D85FB050000 - external (ambient)


// Click on pic -> start video
function streamVideo(port, node, action) {
   $(node).attr("src", "//coolfore.com:"+port+"/?action="+action);
}

// Display a graph
function displayGraph(desc, location, data, typ) {
   var Toptions = {
      title: desc,
      interpolateNulls: true,
      curveType: 'function',
      legend: { position: 'bottom' },
      crosshairs: { orientation: 'vertical', trigger: 'both' },
      vAxis: { 
        title: (typ==="T" ? "Temperature \u00b0C": "Humidity %"), 
        viewWindowMode:'explicit',
        viewWindow:{
          max: typ === "T"? 40 : 100,
          min: 0
        }
      }
   };

   // If external, the max/min are different
   if (location === "#temp3") {
      Toptions.vAxis.viewWindow.max = 25;
      Toptions.vAxis.viewWindow.min = -15;
   }
   

   var dateFormatter = new google.visualization.DateFormat(
                                 { pattern: "dd/MM/yy kk:mm" });
   dateFormatter.format(data, 0);
   var elem = $(location);
   var uchart = new google.visualization.LineChart(elem[0]);
   uchart.draw(data, Toptions);
   elem.parent().width(elem.find("svg").width());
}

// Build up graph data for external sensor
function buildExternal() {
   var data = [];
   var dSize = extData.rows.length;
   for (var iX=0; iX<dSize; iX++) {
      data.push([ new Date(extData.rows[iX].doc.tim), parseInt(extData.rows[iX].doc.val) ]);
   }
   var gData = new google.visualization.DataTable();
   gData.addColumn('date', 'Date');
   gData.addColumn('number', 'Temperature');
   gData.addRows(data);
   displayGraph("External ambient temperature","#temp3", gData, "T");
}

function initializeEntries(time,typ) {
   var entrytab = [];
   var entry;
   for (var iX=0; iX<hiveData.length; iX++) {
      entry = [time === 0? null : new Date(time)];
      if (typ === "T")
         ssize = hiveData[iX].tsensors.length;
        else
         ssize = hiveData[iX].hsensors.length;
      for (var iY=0; iY<ssize; iY++) {
         entry.push(0);
      }
      entrytab.push(entry);
   }
   return entrytab;
}

// Build up graph data for humidity sensors
function buildAllHums(sInfo) {
   var now = 0;
   var hEntry = initializeEntries(0, "H");
   var dSize = humData.rows.length;
   var sensor;
   var lastHumVal = 0;
   for (var iX=0; iX<dSize; iX++) {
      if (humData.rows[iX].doc.tim !== now && now !== 0) {
         for (var iY=0; iY<hiveData.length; iY++) {
            if (hEntry[iY][0] !== null)
               hiveData[iY].ghData.addRow(hEntry[iY]);
         }
         hEntry = initializeEntries(humData.rows[iX].doc.tim, "H");
      }
      now = humData.rows[iX].doc.tim;
      sensor = sInfo['H'+humData.rows[iX].doc.sen.toUpperCase()];
      if (sensor !== undefined && sensor !== null) {
         hEntry[sensor.hive][0]          = new Date(humData.rows[iX].doc.tim);
         var humVal = parseInt(humData.rows[iX].doc.val); 
         if (humVal > 0) {
            lastHumVal = humVal;
         }
         //hEntry[sensor.hive][sensor.sen] = parseInt(humData.rows[iX].doc.val);
         hEntry[sensor.hive][sensor.sen] = lastHumVal;
      }
   }

   for (iX=0; iX<hiveData.length; iX++) {
      if (hEntry[iX][0] !== null)
         hiveData[iX].ghData.addRow(hEntry[iX]);
         displayGraph(hiveData[iX]._id + ": " + hiveData[iX].desc + " (" + hiveData[iX].color
            + " " + hiveData[iX].material + ") at " + hiveData[iX].apiary,
            "#hum"+(iX+1), hiveData[iX].ghData, "H");
   }
}

// Number of degrees of bad variability we can accept
var DELTA = 4;

// Build up graph data for temperature sensors
function buildAllTemps(sInfo) {
   var now = 0;
   var hEntry = initializeEntries(0, "T");
   var dSize = tempData.rows.length;
   var sensor;
   var lastTempVal = 0;
   var lastDHT = [];
   lastDHT["DHT2201"] = 0.0;
   lastDHT["DHT2202"] = 0.0;
   for (var iX=0; iX<dSize; iX++) {
      if (tempData.rows[iX].doc.tim !== now && now !== 0) {
         for (var iY=0; iY<hiveData.length; iY++) {
            if (hEntry[iY][0] !== null)
               hiveData[iY].gtData.addRow(hEntry[iY]);
         }
         hEntry = initializeEntries(tempData.rows[iX].doc.tim, "T");
      }
      now = tempData.rows[iX].doc.tim;
      var sen = tempData.rows[iX].doc.sen.toUpperCase();
      sensor = sInfo['T'+sen];
      if (sensor !== undefined && sensor !== null) {
         hEntry[sensor.hive][0] = new Date(tempData.rows[iX].doc.tim);
         var tempVal = parseInt(tempData.rows[iX].doc.val); 
         // If the DHT22's reading isn't sane, use the last good one
         if (sen.substr(0,5) === "DHT22") {
            if (lastDHT[sen] > 0 && tempVal > 0 &&
                tempVal < lastDHT[sen]+DELTA && tempVal > lastDHT[sen]-DELTA) {
               lastTempVal = tempVal;
               lastDHT[sen] = tempVal;
            }
            else
               lastTempVal = tempVal;
         }
         else
            lastTempVal = tempVal;
         hEntry[sensor.hive][sensor.sen] = lastTempVal;
      }
   }

   for (iX=0; iX<hiveData.length; iX++) {
      if (hEntry[iX][0] !== null)
         hiveData[iX].gtData.addRow(hEntry[iX]);
      displayGraph(hiveData[iX]._id + ": " + hiveData[iX].desc + " (" + hiveData[iX].color
            + " " + hiveData[iX].material + ") at " + hiveData[iX].apiary,
            "#temp"+(iX+1), hiveData[iX].gtData, "T");
   }
}

// Delete unused entries from the hives array
function cleanHives() {
   for (var iX=0; iX<hiveData.length; iX++) {
      if (hiveData[iX].inuse !== true ||
            (hiveData[iX].tsensors.length < 1 && hiveData[iX].hsensors.length < 1)) {
         hiveData.splice(iX,1);
         iX--; // To counteract the increment
      }
   }
   var sInfo = [];
   for (iX=0; iX<hiveData.length; iX++) {
      // Graph data for temperature
      hiveData[iX].gtData = new google.visualization.DataTable();
      hiveData[iX].gtData.addColumn('date', 'Date');
      for (var iY=0; iY<hiveData[iX].tsensors.length; iY++) {
         hiveData[iX].gtData.addColumn('number', hiveData[iX].tsensors[iY].where + " (" + hiveData[iX].tsensors[iY].id + ")");
         sInfo['T'+hiveData[iX].tsensors[iY].id] = {'hive': iX, 'sen':iY+1};
      }

      // Graph data for humidity
      hiveData[iX].ghData = new google.visualization.DataTable();
      hiveData[iX].ghData.addColumn('date', 'Date');
      for (var iY=0; iY<hiveData[iX].hsensors.length; iY++) {
         hiveData[iX].ghData.addColumn('number', hiveData[iX].hsensors[iY].where + " (" + hiveData[iX].hsensors[iY].id + ")");
         sInfo['H'+hiveData[iX].hsensors[iY].id] = {'hive':iX, 'sen':iY+1};
      }
   }
   return sInfo;
}

function drawGauge(temp, id, options) {
   var defaults = {min: -10, max: 30, yellowFrom: 20, yellowTo: 25,
                  redFrom: 25, redTo: 30, minorTicks: 5};
   var elem = $(id)[0];
   gaugeData = new google.visualization.DataTable();
   gaugeData.addColumn('number', '\u00b0C');
   gaugeData.addRows(1);
   gaugeData.setCell(0, 0, temp.toFixed(1));
   var gauge = new google.visualization.Gauge(elem);
   gauge.draw(gaugeData, options ? options : defaults);
   // Force correct width
   $(id).parent().width($(id).find("svg").width());
}

function drawGauge(nodeId, options, temp) {
   gaugeData = new google.visualization.DataTable();
   gaugeData.addColumn('number', '\u00b0C');
   gaugeData.addRows(1);
   gaugeData.setCell(0, 0, temp.toFixed(1))
   var gauge = new google.visualization.Gauge($(nodeId)[0]);
   gauge.draw(gaugeData, options);
   $(nodeId).parent().width($(nodeId).find("svg").width());
}


function genGauges() {
   var URL = "//coolfore.com/sensor.php?sensor=8D85FB050000+1BE4FA050000+71EEFA050000";
   var options = {min: -15, max: 35, yellowFrom: 25, yellowTo: 30,
                  redFrom: 30, redTo: 35, minorTicks: 5};
   $.ajax({
      url: URL,
      dataType: "json",
      success: function(entries) {
         $.each(entries, function(index, entry) {
            if (entry.id === "8D85FB050000") {
               options = {min: -15, max: 35, yellowFrom: 25, yellowTo: 30,
                          redFrom: 30, redTo: 35, minorTicks: 5};
            } else {
               options = {min: 15, max: 45, yellowFrom: 39, yellowTo: 42,
                          redFrom: 42, redTo: 45, minorTicks: 5};
            }
            drawGauge("#"+entry.id, options, entry.temp);
         });

      }
   });
   return null;
}

