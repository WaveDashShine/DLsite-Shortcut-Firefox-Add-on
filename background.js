/* DLsite REGEX, parts separated in order:
 1) product code
 2) group code
 *) \b specifies boundary
 */
var regex = /(R|V|B)((J|E)\d{6}|(G)\d{5})/gi;

/* DLsite URL structures:
 1) product code
 2) product code (number only)
 3) group code
 */
var dlsite = "http://www.dlsite.com/home/work/=/product_id/";
var dlsiteNum = "http://www.dlsite.com/home/work/=/product_id/RJ";
var dlsiteGroup = "http://www.dlsite.com/maniax/circle/profile/=/maker_id/";

/*
 VARIOUS CONTENT SCRIPTS FOR THE CONTEXT MENU
 */

/* CONTEXT MENU OPEN IN DLSITE
 1) context menu item to open product codes in DLsite
 */
// TODO: selection based on matching regex
browser.contextMenus.create({
    id: "shortcut",
    title: "Open DLsite 開",
    contexts: ["selection"]
});

//TODO: doesn't actually work wtfff
browser.contextMenus.onClicked.addListener(function(info, tab) {
    switch (info.menuItemId){
        case "shortcut":
            console.log("shortcut" + info.selectionText);
            break;
    }
});

/* PRODUCT CODE PREDICATE FUNCTION FOR CONTEXT MENU
 1) Returns TRUE if selected text contains dlsite product code
 */
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

// TODO: web_accessible_resources for language toggle? or injection of DLsite images?