var theCouch;


String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function pageLoaded () {
    theCouch = new PouchDB('http://127.0.0.1:5984/boms');
}

function Upload() {
	"use strict";

    var x, fileSelector = document.getElementById("bomFile"), file, reader = new FileReader(), bomText, finalText, postObj = [], postJSON;
    file = fileSelector.files[0];
	reader.onload = function (e) {
		finalText = reader.result;
		var finalArray = finalText.split("\n"), poster = new XMLHttpRequest();
		for (x = 0; x < finalArray.length; x++) {
			finalArray[x] = finalArray[x].split(",");
		}
        postObj = {"_id" : document.getElementById("bomFile").value.split(" ").join("/").hashCode().toString(), "components" : []};
		for (x = 0; x < finalArray.length; x++) {
            postObj.components[x] = {};
			postObj.components[x].refdes = finalArray[x][0];
			postObj.components[x].device = finalArray[x][1];
			postObj.components[x].value = finalArray[x][2];
			postObj.components[x].footprint = finalArray[x][3];
			postObj.components[x].source = finalArray[x][4];
			postObj.components[x].partnumber = finalArray[x][5];
		}

		theCouch.put(postObj, function callback (err, res) {
            if(!err) {
                alert("Put a thing!");
            } else {
                console.log(err);
            }
        });
    };
	reader.readAsText(file, "text/csv");
}
