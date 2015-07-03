var theCouch;
var chooseItemEnable;

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
    updateChooseMenu();
}

function updateChooseMenu () {
    chooseItemEnable = true;
    var bomMenu = document.getElementById("chooseBom");
    bomMenu.innerHTML = "<option value=\"chooseone\">Choose one</option>";
    theCouch.allDocs({
        include_docs: true
    }).then(function (docs) {
        docs = docs.rows;
        for(var x = 0; x < docs.length; x++) {
            var listItem = document.createElement("option");
            listItem.value = x.toString();
            listItem.innerHTML = docs[x].doc.name;
            bomMenu.appendChild(listItem);
        }
    }).catch(function (err) {
        console.log(err);
    });
}

function Upload() {
	"use strict";

    var x, y, fileSelector = document.getElementById("bomFile"), file, reader = new FileReader(), bomText, finalText, postObj = [], postJSON;
    file = fileSelector.files[0];
	reader.onload = function (e) {
		finalText = reader.result;
		var finalArray = finalText.split("\n"), poster = new XMLHttpRequest(), partNumbers = [];
		for (x = 0; x < finalArray.length; x++) {
			finalArray[x] = finalArray[x].split(",");
		}
        postObj = {"name": document.getElementById("bomName").value, "components" : []};
		for (x = 0; x < finalArray.length; x++) {
            partNumbers = [];
            if (partNumbers.length == 0 || partNumbers.search(finalArray[x][5]) == -1) {
                postObj.components[x] = {};
                postObj.components[x].refdes = finalArray[x][0];
                postObj.components[x].device = finalArray[x][1];
                postObj.components[x].value = finalArray[x][2];
                postObj.components[x].source = finalArray[x][3];
                postObj.components[x].partnumber = finalArray[x][4];
                partNumbers[x] = finalArray[x][5];
            } else {
               for (y = 0; y < postObj.components.length; y++) {
                   if(postObj.components[y].partnumber == finalArray[x][5]) {
                       postObj.components[y].quantity += 1;
                       break;
                   }
               }
            }
		}

		theCouch.upsert(document.getElementById("bomName").value.split(" ").join("/").hashCode().toString(), function(blankObj) {
            return postObj;
        }, function callback (err, res) {
            if(!err) {
                alert("Put a thing!");
                updateChooseMenu();
            } else {
                console.log(err);
            }
        });
    };
	reader.readAsText(file, "text/csv");
}


function listBom() {
    var bomMenu = document.getElementById("chooseBom");
    if(chooseItemEnable) {
        bomMenu.removeChild(bomMenu.children[0]);
        chooseItemEnable = false;
    }
    var table = document.getElementById("displayBOMTable");
    table.innerHTML = "<tr><td>REFDES</td>\<td>DEVICE</td><td>VALUE</td><td>SOURCE</td><td>PARTNUM</td></tr>";
    theCouch.allDocs({
        include_docs: true
    }).then(function (docs) {
        var components = docs.rows[bomMenu.selectedIndex].doc.components;
        for(var x = 0; x < components.length - 1; x++) {
            var tableRow = table.children[0].cloneNode(true).children[0];
            tableRow.children[0].innerHTML = components[x].refdes;
            tableRow.children[1].innerHTML = components[x].device;
            tableRow.children[2].innerHTML = components[x].value;
            tableRow.children[3].innerHTML = components[x].source;
            tableRow.children[4].innerHTML = components[x].partnumber;
            table.appendChild(tableRow);
        }
    }).catch(function (err) {
        console.log(err);
    });
}
