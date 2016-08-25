var self = require("sdk/self");

var selection = require("sdk/selection");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var cm = require("sdk/context-menu");

// regex for the product codes in DLsite

var regex = /(R|V|B)(J|E)\d{6}/gi;
var regexGroup = /(R|V|B)(G)\d{5}/gi;

var dlsite = "http://www.dlsite.com/home/work/=/product_id/";
var dlsiteGroup = "http://www.dlsite.com/maniax/circle/profile/=/maker_id/";

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
    openDLsite(selectionText);
  },
  context: [cm.PredicateContext(isProductCode), cm.SelectionContext()]
});

/*** CONTEXT MENU LANGUAGE TOGGLE
1) context menu item to toggle between ENG and JP
*) currently only compatible with RE and RJ codes
***/
var langMenu = cm.Item({
  label: "Toggle language",
  image: self.data.url("./DL-16.png"),
  contentScript: 'self.on("click", function () {' +
                 '  self.postMessage();' +
                 '});',
  onMessage: function () {
    languageToggle();
  },
  context: cm.URLContext("*.dlsite.com")
});

/*** PREDICATE FUNCTION FOR CONTEXT MENU
1) Returns TRUE if selected text contains dlsite product code
***/
function isProductCode(data){
  if (data.selectionText === null) {
    return false;
  }
  var match = data.selectionText.match(regex);
  var matchGroup = data.selectionText.match(regexGroup);
  if (match||matchGroup) {
    return true;
  }
}

/*** DLSITE BUTTON 
1) can open the DLsite homepage
2) can toggle DLsite language
***/
var button = buttons.ActionButton({
  id: "dlsite-link",
  label: "DLsite Shortcut",
  icon: {
    "16": "./DL-16.png",
    "32": "./DL-32.png",
    "64": "./DL-64.png"
  },
  onClick: function(state){
    openHome();
    languageToggle();
  }
});

/*** OPEN DLSITE HOMEPAGE
1) opens the DLsite homepage if not already on the site
***/
function openHome() {
  var active = tabs.activeTab.url;

  if (!active.includes("dlsite.com")){
    tabs.open("http://www.dlsite.com/");
  }
}

/*** BUTTON FUNCTION LANGUAGE TOGGLE and OPEN DLsite
1) loads DLsite.com in new tab if active tab does not have DLsite open
2) if product code is detected in URL, toggles the region language

RE    : RJ
eng   : home
ecchi-eng : maniax

***/
function languageToggle() {
  // variables for the product codes and various language conversion
  // case 1:
  var rj = "/product_id/RJ";
  var re = "/product_id/RE";
  // case 2:
  var eng = "/eng";
  var home = "/home";
  // case 3:
  var ecchi = "/ecchi-eng";
  var maniax = "/maniax";
  // case 4:
  var gayEng = "/gay-eng";
  var gay = "/gay";
  // case 5: converts to eng
  // TODO need to add soft/pro option for groups
  var girls = "/girls";

  var active = tabs.activeTab.url;

  if (active.includes("dlsite.com")){

  	if (active.includes(rj)){
  		tabs.activeTab.url = active.replace(rj,re);
  	} else if (active.includes(re)){
  		tabs.activeTab.url = active.replace(re,rj); 
  	} else if (active.includes(eng)){
      tabs.activeTab.url = active.replace(eng,home);
    } else if (active.includes(home)){
      tabs.activeTab.url = active.replace(home,eng);
    } else if (active.includes(ecchi)){
      tabs.activeTab.url = active.replace(ecchi,maniax);
    } else if (active.includes(maniax)){
      tabs.activeTab.url = active.replace(maniax,ecchi);
    } else if (active.includes(gayEng)){
      tabs.activeTab.url = active.replace(gayEng,gay);
    } else if (active.includes(gay)){
      tabs.activeTab.url = active.replace(gay,gayEng);
    } else if (active.includes(girls)){
      tabs.activeTab.url = active.replace(girls,eng);
    } 

  }
}

/*** HELPER for opening DLsite 
1) opens sanitized text DLsite
2) depending on product code or group code
***/
function openDLsiteHelper(array){

  if(array){
    for (var i = 0; i < array.length; i++) {
      if(array[i].includes("G")||array[i].includes("g")){
        tabs.open(dlsiteGroup+array[i].toUpperCase());
      } else {
        tabs.open(dlsite+array[i].toUpperCase());
      }
    }
  }

}

/*** SEARCH SELECTION FOR DLSITE PRODUCT CODE AND OPENS CORRESPONDING PAGE
1) opens sanitized text DLsite
*) match() returns an array object if match is found, null otherwise
***/
function openDLsite(text){
  var matchArray = text.toString().match(regex);
  var matchArrayGroup = text.toString().match(regexGroup);
  
  openDLsiteHelper(matchArray);
  openDLsiteHelper(matchArrayGroup);
}