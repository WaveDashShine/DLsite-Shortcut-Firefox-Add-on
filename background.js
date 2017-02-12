/* DLsite REGEX, covers group code and product code
 */
var regex = /(R|V|B)((J|E)\d{6}|(G)\d{5})/gi;

/* DLsite URLs
 */
var homepage = "http://www.dlsite.com/"
var dlsiteProduct = homepage + "home/work/=/product_id/";
var dlsiteGroup = homepage + "maniax/circle/profile/=/maker_id/";

/*
 VARIOUS CONTENT SCRIPTS FOR THE CONTEXT MENU
 */

/* CONTEXT MENU OPEN IN DLSITE
 1) context menu item to open group or product codes in DLsite
 */
// TODO: selection based on matching regex
browser.contextMenus.create({
    id: "shortcut",
    title: "Open DLsite 開",
    contexts: ["selection"]
});

// TODO: how to assign different icons to different context menus?

// gate the DLsite preview here?
browser.contextMenus.onClicked.addListener(function(info, tab) {
    switch (info.menuItemId){
        case "shortcut":
            openDLsite(info.selectionText);
            break;
    }
});

/* PRODUCT CODE PREDICATE FUNCTION FOR CONTEXT MENU
 1) Returns TRUE if selected text contains dlsite product code
 */
function isProductCode(data){
    if (data === typeof "undefined" || data.selectionText === null) {
        return false;
    }
    var match = data.selectionText.match(regex);
    if (match) {
        return true;
    }
    return false;
}

/* NUMBER CHECKER
 1) returns true if variable is a number
 */
function isNumber(n){
    return !isNaN(n);
}

/* HELPER for opening DLsite
 1) opens sanitized text DLsite
 2) depending on product code or group code
 3) if product code is number only, default to RJ
 */
// TODO: open DLsite should open in private window if selection is made in private window
function openDLsiteHelper(array){

    if(array !== typeof "undefined" && array !== null){
        for (var i = 0; i < array.length; i++) {
            if(array[i].includes("G")||array[i].includes("g")){
                var group = browser.tabs.create({
                    url: dlsiteGroup+array[i].toUpperCase()
                });
            } else {
                var product = browser.tabs.create({
                    url: dlsiteProduct+array[i].toUpperCase()
                });
            }
        }
    }

}

/* OPEN DLsite
 1) opens sanitized product or group code in DLsite
 2) if DLsite code is number only, default RJ page
 *) match() returns an array object if match is found, null otherwise
 */
function openDLsite(text){
    var matchArray = text.toString().match(regex);
    openDLsiteHelper(matchArray);
}

// TODO: web_accessible_resources for language toggle? or injection of DLsite images?