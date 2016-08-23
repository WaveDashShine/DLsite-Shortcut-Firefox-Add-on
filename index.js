var self = require("sdk/self");

/***
// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;
***/

/*** 
WARNING:
sdk self is initialized above the dummy code
add it back when the app breaks when the dummy is removed
***/

var selection = require("sdk/selection");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var cm = require("sdk/context-menu");

// regex for the product codes in DLsite
var regex = /R(J|E)\d{6}/g;
// TODO: implement default DLsite in options
var dlsite = "http://www.dlsite.com/home/work/=/product_id/";

// console logs for superficially checking that index.js is running
//console.log("index.js is running...");

/*** CONTEXT MENU OPEN IN DLSITE
1) context menu item to open product codes in DLsite
*) currently only compatible with RE and RJ codes
***/
// dlMenu.parentMenu.items[0].destroy(); if you need to destroy the cm.Item
var dlMenu = cm.Item({
  label: "Open in DLsite",
  image: self.data.url("./DL-16.png"),
  contentScript: 'self.on("click", function () {' +
                 '  var text = window.getSelection().toString();' +
                 '  self.postMessage(text);' +
                 '});',
  onMessage: function (selectionText) {
    //console.log("Selected text is: " + selectionText);
    openDLsite(selectionText);
  },
  context: [cm.PredicateContext(isProductCode), cm.SelectionContext()]
});

/*** CONTEXT MENU LANGUAGE TOGGLE
1) context menu item to toggle between ENG and JP
*) currently only compatible with RE and RJ codes
***/

/*** PREDICATE FUNCTION FOR CONTEXT MENU
1) Returns TRUE if selected text contains dlsite product code
***/
function isProductCode(data){
  if (data.selectionText === null) {
    return false;
  }
  var match = data.selectionText.match(regex);
  if (match) {
    return true;
  }
}

/*** DLSITE BUTTON 
***/
var button = buttons.ActionButton({
  id: "dlsite-link",
  label: "DLsite JP <-> ENG",
  icon: {
    "16": "./DL-16.png",
    "32": "./DL-32.png",
    "64": "./DL-64.png"
  },
  onClick: languageToggle
});

/*** BUTTON FUNCTION LANGUAGE TOGGLE and OPEN DLsite
1) loads DLsite.com in new tab if active tab does not have DLsite open
2) if product code is detected in URL, toggles the region language
*) TODO: refactor and separate functions
***/
function languageToggle() {
  var jp = "/product_id/RJ";
  var eng = "/product_id/RE";
  var active = tabs.activeTab.url;

  if (!active.includes("dlsite.com")){
  	tabs.open("http://www.dlsite.com/");
  }

  //TODO: can language toggle predict the next page?
  if (active.includes("dlsite.com")){
  	if (active.includes(jp)){
  		tabs.activeTab.url = active.replace(jp,eng);
  	} else if (active.includes(eng)){
  		tabs.activeTab.url = active.replace(eng,jp); 
  	}
  }
}

/*** SEARCH SELECTION FOR DLSITE PRODUCT CODE AND OPENS CORRESPONDING PAGE
TODO: refactor code to separate functions
1) opens sanitized text DLsite
*) match() returns an array object if match is found, null otherwise
***/
function openDLsite(text){
  //console.log("text is: " + text);
  var matchArray = text.toString().match(regex);
  //console.log("matched regex is: " + matchArray);
  if(matchArray) {
    //console.log("length of Array is: " + matchArray.length);
    for (var i = 0; i < matchArray.length; i++) {
      //console.log("Number " + i + " in the array is: " + matchArray[i]);
      tabs.open(dlsite+matchArray[i]);
    }
  }
}