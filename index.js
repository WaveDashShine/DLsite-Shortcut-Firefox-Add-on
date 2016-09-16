var self = require("sdk/self");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var cm = require("sdk/context-menu");

/*** DLsite REGEX, parts separated in order:
1) product code
2) product code (number only)
3) group code
*) \b specifies boundary
***/
var regex = /(R|V|B)(J|E)\d{6}|\b\d{6}\b|(R|V|B)(G)\d{5}/gi;

/*** DLsite URL structures:
1) product code
2) product code (number only)
3) group code
***/
var dlsite = "http://www.dlsite.com/home/work/=/product_id/";
var dlsiteNum = "http://www.dlsite.com/home/work/=/product_id/RJ";
var dlsiteGroup = "http://www.dlsite.com/maniax/circle/profile/=/maker_id/";

/*** VARIOUS CONTENT SCRIPTS FOR THE CONTEXT MENU
 ***/
var basicPostScript = 'self.on("click", function (node, data) {' +
    '  self.postMessage();' +
    '});';

var postSelectionScript = 'self.on("click", function (node, data) {' +
    '  var text = window.getSelection().toString();' +
    '  self.postMessage(text);' +
    '});';

// Regex needs \\ double backslash to prevent string escape from breaking content script
// Warning: updates to the above regex need to be repeated below
var numberFoundScript = 'self.on("context", function () {' +
// TODO: wrap in selected exists if statement
// then we may not need the if found afterwords
    '  var selected = window.getSelection().toString();' +
    '  var regex = /(R|V|B)(J|E)\\d{6}|\\b\\d{6}\\b|(R|V|B)(G)\\d{5}/gi;' +
    '  var found = selected.match(regex);' +
    '  if (found) { var foundNum = found.length; ' +
    '  return "Open DLsite 開: " + foundNum; }' +
    '  else return "Open DLsite 開";' +
    '});';

/*** CONTEXT MENU LANGUAGE TOGGLE
 1) context menu item to toggle between ENG and JP
 *) currently only compatible with RE and RJ codes
 ***/
// TODO: prevent language toggle from showing at the navigation page
var langMenu = cm.Item({
  label: "日本語 ↔ English",
  context: cm.URLContext("*.dlsite.com"),
  image: self.data.url("./DL2-16.png"),
  contentScript: basicPostScript,
  onMessage: function () {
    languageToggle();
  }
});

/*** CONTEXT MENU OPEN IN DLSITE
1) context menu item to open product codes in DLsite
***/
// dlMenu.parentMenu.items[0].destroy(); if you need to destroy the cm.Item
var dlMenu = cm.Item({
  label: "Open DLsite 開",
  context: [cm.PredicateContext(isProductCode), cm.SelectionContext()],
  image: self.data.url("./DL-16.png"),
  contentScript: postSelectionScript + numberFoundScript,
  onMessage: function (selectionText) {
      // TODO: refactor code to save space from rematching code, use helper function
    openDLsite(selectionText);
  }
});

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
  return false;
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
*) replace(): replaces only the first match in the string
PENDING: fleshed out language toggle feature
***/
function languageToggle() {
  // variables for the product codes and various language conversion
  // case 1:
  var rj = "/product_id/RJ";
  var re = "/product_id/RE";
  // case 2:
  var eng = "/eng";
  var home = "/home";
  var comic = "/comic";
  var soft = "/soft";
  // case 3:
  var ecchi = "/ecchi-eng";
  var maniax = "/maniax";
  var books = "/books";
  var pro = "/pro";
  // case 4:
  var gayEng = "/gay-eng";
  var gay = "/gay";
  var girls = "/girls";
  var girlsPro = "/girls-pro";

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
    } else if (active.includes(comic)){
      tabs.activeTab.url = active.replace(comic,eng);
    } else if (active.includes(soft)){
      tabs.activeTab.url = active.replace(soft,eng);
    } else if (active.includes(ecchi)){
      tabs.activeTab.url = active.replace(ecchi,maniax);
    } else if (active.includes(maniax)){
      tabs.activeTab.url = active.replace(maniax,ecchi);
    } else if (active.includes(books)){
      tabs.activeTab.url = active.replace(books,ecchi);
    } else if (active.includes(pro)){
      tabs.activeTab.url = active.replace(pro,ecchi);
    } else if (active.includes(gayEng)){
      tabs.activeTab.url = active.replace(gayEng,gay);
    } else if (active.includes(gay)){
      tabs.activeTab.url = active.replace(gay,gayEng);
    } else if (active.includes(girlsPro)){
      tabs.activeTab.url = active.replace(girlsPro,gayEng);
    } else if (active.includes(girls)){
      tabs.activeTab.url = active.replace(girls,gayEng);
    } 

  }
}

/*** NUMBER CHECKER
1) returns true if variable is a number
***/
function isNumber(n){
  return !isNaN(n);
}

/*** HELPER for opening DLsite 
1) opens sanitized text DLsite
2) depending on product code or group code
3) if product code is number only, default to RJ
***/
function openDLsiteHelper(array){

  if(array){
    for (var i = 0; i < array.length; i++) {
      if(array[i].includes("G")||array[i].includes("g")){
        tabs.open(dlsiteGroup+array[i].toUpperCase());
      } else if(isNumber(array[i])) {
        tabs.open(dlsiteNum+array[i]);
      } else {
        tabs.open(dlsite+array[i].toUpperCase());
      }
    }
  }

}

/*** OPEN DLsite
1) opens sanitized product or group code in DLsite
2) if DLsite code is number only, default RJ page
*) match() returns an array object if match is found, null otherwise
***/
function openDLsite(text){
    // TODO: make sure text exists before matching
  var matchArray = text.toString().match(regex);
  openDLsiteHelper(matchArray);
}
