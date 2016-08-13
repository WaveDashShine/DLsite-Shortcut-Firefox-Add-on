var self = require("sdk/self");

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;

/*** 
WARNING:
sdk self is initialized in the dummy code
add it back when the app breaks when the dummy is removed
***/

var selection = require("sdk/selection");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var regex = /R(J|E)\d{6}/g;
// TODO: implement default DLsite in options
var dlsite = "http://www.dlsite.com/home/work/=/product_id/";

// console logs for superficially checking that index.js is running
console.log("index.js is running...");

// TODO: make the icons
var button = buttons.ActionButton({
  id: "dlsite-link",
  label: "Jump between JP and ENG",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: languageToggle
});

/***
1) loads DLsite.com in new tab if active tab does not have DLsite open
2) if product code is detected in URL, toggles the region language
***/
function languageToggle(state) {
  var jp = "/product_id/RJ";
  var eng = "/product_id/RE";
  var active = tabs.activeTab.url;

  if (!active.includes("dlsite.com")){
  	tabs.open("http://www.dlsite.com/");
  }

  if (active.includes("dlsite.com")){
  	if (active.includes(jp)){
  		tabs.activeTab.url = active.replace(jp,eng);
  	} else if (active.includes(eng)){
  		tabs.activeTab.url = active.replace(eng,jp); 
  	}
  }
}

/***
1) opens DLsite in either ENG or JP according to preferences
***/
function openDLsite(code){
	tabs.open(dlsite+code);
}

// TODO: make it so that DLsite opens when you double click instead of select
selection.on('select',function(){
	if(selection.text){
		var selectedString = selection.text.toString();
		console.log("selected string is \"" + selectedString + "\"");
		var matchArray = selectedString.match(regex);
		console.log(matchArray);

		// WARNING THIS CODE DOESN'T WORK AS INTENDED
		if (Array.isArray(matchArray)) {
			if (!selection.isContiguous) {
				for (var i = 0; i < matchArray.length; i++){
					openDLsite(matchArray[i]);
				}
			} else {
				var first = matchArray.shift();
				openDLsite(first);
			}
		}
	}
});