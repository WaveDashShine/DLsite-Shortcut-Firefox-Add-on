/* DLsite REGEX, covers group code and product code
 */
var regex = /(R|V|B)((J|E)\d{6}|(G)\d{5})/gi;

/* DLsite URLs
 */
var homepage = "http://www.dlsite.com/";
var dlsiteProductUrl = homepage + "home/work/=/product_id/";
var dlsiteGroupUrl = homepage + "maniax/circle/profile/=/maker_id/";

/*
 VARIOUS CONTENT SCRIPTS FOR THE CONTEXT MENU
 */

/* CONTEXT MENU: OPEN IN DLSITE
 1) context menu item to open group or product codes in DLsite
 */
// TODO: selection based on matching regex
chrome.contextMenus.create({
    id: "shortcut",
    title: "Open DLsite 開",
    contexts: ["selection"]
});

/* CONTEXT MENU: activates preview images to DLsite products on the page
 1) context menu item to preview group or product codes in DLsite
 */
// TODO: how to toggle script? maybe just don't toggle it and load it when clicked
chrome.contextMenus.create({
    id: "preview",
    //type: "checkbox",
    //checked: false,
    title: "Preview DLsite",
    contexts: ["all"]
});

// TODO: how to assign different icons to different context menus?

// gate the DLsite preview here?
/* LISTENER FOR THE CONTEXT MENUS
 1) handles the behaviour of each context menu item
 */
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch (info.menuItemId){
        case "shortcut":
            console.log(info.selectionText);
            openDLsite(info.selectionText);
            break;
        case "preview":
            previewDLsite();
            break;
        default:
            console.log("ERROR: No DLsite Context Menu id was matched");
    }
});

/* PRODUCT CODE PREDICATE FUNCTION FOR CONTEXT MENU
 1) Returns TRUE if selected text contains dlsite product code
 */
function isProductCode(data){
    if (typeof data === "undefined" || data.selectionText === null) {
        return false;
    }
    return data.selectionText.match(regex) !== null;
}

/* HELPER for opening DLsite
 1) opens sanitized group or product code in DLsite
 */
// TODO: don't open duplicates? var opened = []
function openDLsiteHelper(url, code){
    var group = chrome.tabs.create({
        url: url + code
    });
}

/* OPEN DLsite
 1) opens sanitized product or group code in DLsite
 2) if DLsite code is number only, default RJ page
 *) match() returns an array object if match is found, null otherwise
 */
function openDLsite(text){
    var array = text.toString().match(regex);
    console.log(array);
    if(typeof array !== "undefined" && array !== null){
        for (var i = 0; i < array.length; i++) {
            if(array[i].toUpperCase().includes("G")){
                openDLsiteHelper(dlsiteGroupUrl, array[i].toUpperCase());
            } else {
                openDLsiteHelper(dlsiteProductUrl, array[i].toUpperCase());
            }
        }
    }
}

/* TODO: ACTIVATES PREVIEWS FOR DLSITE PRODUCT AND GROUP CODES
1)
2)
3)
 */
function previewDLsite(){

    chrome.tabs.executeScript({
        file: "/preview.js"
    });

    // TODO: send state of toggle as message to preview.js
    chrome.tabs.query({active: true, currentWindow: true},function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {
            regex: regex,
            dlsiteProductUrl: dlsiteProductUrl,
            dlsiteGroupUrl: dlsiteGroupUrl
        }, function(response){
            console.log("response was " + response.preview);
        });
    });

}

// TODO: web_accessible_resources for language toggle? or injection of DLsite images?
