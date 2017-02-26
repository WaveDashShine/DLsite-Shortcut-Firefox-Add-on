/* DLsite REGEX, covers group code and product code
 */
var regexDLsite = /(R|V|B)((J|E)\d{6}|(G)\d{5})/gi;

// found the URL regex online, removed the query strings since those are irrelevant for our purposes
var regexUrl = /\b((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+)\b/;

/* DLsite URLs
 */
var homepage = "http://www.dlsite.com/";
var dlsiteProductUrl = homepage + "home/work/=/product_id/";
var dlsiteGroupUrl = homepage + "maniax/circle/profile/=/maker_id/";

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
            alert("ERROR: No DLsite Context Menu id was matched");
    }
});

/* PRODUCT CODE PREDICATE FUNCTION FOR CONTEXT MENU
 1) Returns TRUE if selected text contains dlsite product code
 */
function isProductCode(data){
    if (typeof data === "undefined" || data.selectionText === null) {
        return false;
    }
    return data.selectionText.match(regexDLsite) !== null;
}

/* HELPER for opening DLsite
 1) opens sanitized group or product code in DLsite
 */
function openDLsiteHelper(url){
    var group = chrome.tabs.create({
        url: url
    });
}

/* OPEN DLsite
 1) opens sanitized product or group code in DLsite
 2) if DLsite code is number only, default RJ page
 *) match() returns an array object if match is found, null otherwise
 */
// TODO: don't open duplicates? var opened = []
function openDLsite(text){
    var array = text.toString().match(regexDLsite);
    console.log(array);
    if(typeof array !== "undefined" && array !== null){
        for (var i = 0; i < array.length; i++) {
            if(array[i].toUpperCase().includes("G")){
                openDLsiteHelper(dlsiteGroupUrl + array[i].toUpperCase());
            } else {
                openDLsiteHelper(dlsiteProductUrl + array[i].toUpperCase());
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

    sendRequestToTab({
        action: "getDocument"
    });
}

/*

 */
function sendRequestToTab(requestObject){
    chrome.tabs.query({active: true, currentWindow: true},function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, requestObject, function(response){
            if (typeof response !== "undefined" && response !== null){
                handleResponseData(response);
            }
        });
    });
}

/*

 */
function handleResponseData(response){
    switch (response.action){
        case "getDocument":
            var matchArray = response.documentTextContent.match(regexDLsite);
            if (typeof matchArray !== "undefined" && matchArray !== null){
                // TODO: send state of toggle as message to preview.js
                var images = getImageObjectsFromMatchArray(matchArray);
                sendRequestToTab({
                    action: "insertImage",
                    regex: regexDLsite,
                    images: images
                });
            }
            break;
        case "insertImage":
            // stub
            break;
        default:
            alert("ERROR: could not handle response action");
    }
}

/*
TODO: CURRENT IMPLMENTATION IS TOO SLOW NEED TO SEND MESSAGE WITH ONE IMAGE AT A TIME TO APPEND
*/
function getImageObjectsFromMatchArray(matchArray){
    var imageObjectArray = [];
    for (i = 0; i < matchArray.length; i++){
        var imageObject = getDLsiteProductCodeImageData(matchArray[i].toUpperCase());
        imageObjectArray.push(imageObject);
    }
    return imageObjectArray;
}

/* GETS THE IMAGE SOURCE IF IT IS A PROUDCT
 1) XHR to DLsite URL
 2) Parses HTML to find product image
 3) returns the src to the product image
 *) DOES NOT WORK ON SOME SITES DUE TO CROSS ORIGIN POLICY
 */
function getDLsiteProductCodeImageData(productCode){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", dlsiteProductUrl + productCode, false); // false = sync
    xhr.send();
    if (xhr.status == 200){
        var xhrText = xhr.responseText;
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhrText, "text/html");
        var imageHtml = doc.querySelectorAll('[class="slider_item active"]')[0].innerHTML;
        var imageSrc = imageHtml.match(regexUrl);
        return {
            productCode: productCode,
            source: imageSrc[0],
            pageUrl :xhr.responseURL
        };
    } else {
        // TODO: return 404 error or error image?
        return "";
    }
}