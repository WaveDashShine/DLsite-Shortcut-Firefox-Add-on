// TODO: use functionname = function() {} to make it clearer that functions are objects
// TODO: minimalize global variables, use wrapper?
// TODO: store image URLs in add on data

// TODO: handle group strings
var regexDLsiteString = "(R|V|B)((J|E)\\d{6}|(G)\\d{5})"; // Chrome compatibility
var regexDLsite = new RegExp(regexDLsiteString, "gi");

// found the URL regex online, removed the query strings since those are irrelevant for our purposes
var regexUrl = /\b((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+)\b/;


// DLsite URLs
var homepage = "http://www.dlsite.com/";
var dlsiteProductUrl = homepage + "home/work/=/product_id/";
var dlsiteGroupUrl = homepage + "maniax/circle/profile/=/maker_id/";

// CONTEXT MENU item to open group or product codes in DLsite
// TODO: selection based on matching regex
// TODO: show number of matches?
chrome.contextMenus.create({
    id: "shortcut",
    title: chrome.i18n.getMessage("contextMenuOpenDLsite"),
    contexts: ["selection"]
});

// CONTEXT MENU item to preview group or product codes in DLsite
// TODO: how to toggle script? maybe just don't toggle it and load it when clicked
// TODO: prevent user from clicking twice
// Chrome loads the images one at a time, instead of all at once
chrome.contextMenus.create({
    id: "preview",
    //type: "checkbox",
    //checked: false,
    title: chrome.i18n.getMessage("contextMenuPreview"),
    contexts: ["all"]
});

// TODO: how to assign different icons to different context menus? is this even supported

// TODO: gate the DLsite preview here? if preview is already running, don't run it again
// TODO: use the tab id for stopping preview from running multiple times?
/* LISTENER FOR THE CONTEXT MENUS
 1) handles the behaviour of each context menu item
 */
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch (info.menuItemId) {
        case "shortcut":
            console.log(info.selectionText);
            openDLsite(info.selectionText);
            break;
        case "preview":
            previewDLsite();
            break;
        default:
            alert("ERROR: No Context Menu id was matched");
    }
});

/* OPEN DLsite
 1) opens sanitized product or group code in DLsite
 *) match() returns an array object if match is found, null otherwise
 */
function openDLsite(text) {
    var productCodeMatchArray = removeDuplicatesFromArray(text.toString().match(regexDLsite));
    if (isObjectValid(productCodeMatchArray)) {
        for (var i = 0; i < productCodeMatchArray.length; i++) {
            if (productCodeMatchArray[i].toUpperCase().indexOf("G") > -1) {
                openDLsiteProductPageInBrowser(dlsiteGroupUrl + productCodeMatchArray[i].toUpperCase());
            } else {
                openDLsiteProductPageInBrowser(dlsiteProductUrl + productCodeMatchArray[i].toUpperCase());
            }
        }
    }
}

function openDLsiteProductPageInBrowser(url) {
    var group = chrome.tabs.create({
        url: url
    });
}

function previewDLsite() {
    // TODO: prevent preview.js from executing if the user already executed it in the tab
    chrome.tabs.executeScript({
        file: "/preview.js"
    });

    sendRequestToActiveTab({
        action: "previewGetMatches",
        regex: regexDLsiteString
    });
}

function sendRequestToActiveTab(requestObject) {
    chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, requestObject, function(response) {
            if (isObjectValid(response)) {
                handleResponseData(response);
            }
        });
    });
}

function handleResponseData(response) {
    switch (response.action) {
        case "previewGetMatches":
            var matchArray = removeDuplicatesFromArray(response.matches);
            if (isObjectValid(matchArray)) {
                // TODO: send state of toggle as message to preview.js
                // TODO: toggle hides the images (sets CSS attribute?)
                console.log("matchArray Background.js = "+matchArray);
                getImageObjectsFromMatchArray(matchArray);
            }
            break;
        case "previewInsertImage":
            // stub
            break;
        default:
            alert("ERROR: could not handle response action");
    }
}

function removeDuplicatesFromArray(array) {
    var tempSet = new Set();
    for (var i = 0; i < array.length; i++) {
        tempSet.add(array[i]);
    }
    return Array.from(tempSet);
}

function getImageObjectsFromMatchArray(matchArray) {
    for (var i = 0; i < matchArray.length; i++) {
        //TODO: listener for when tabs are closed
        // TODO: a global set for DLsite product values -- storage API
        // TODO: notifications when completed -- API
        var imageObject = getDLsiteProductCodeImageData(matchArray[i].toUpperCase());
        console.log(imageObject.productCode + " " + imageObject.pageUrl + " " + imageObject.source);
        sendRequestToActiveTab({
            action: "previewInsertImage",
            imageObject: imageObject
        });
    }
}

/* GETS THE IMAGE SOURCE IF IT IS A PRODUCT
 1) XHR to DLsite URL
 2) Parses HTML to find product image
 3) returns the src to the product image
 *) DOES NOT WORK ON SOME SITES DUE TO CROSS ORIGIN POLICY
 */
function getDLsiteProductCodeImageData(productCode) {
    var dlsiteProductPageUrl = dlsiteProductUrl + productCode;
    var responseObject = getResponseObjectFromUrl(dlsiteProductPageUrl);
    if (!isObjectValid(responseObject))
        return null;
    var htmlText = responseObject.responseHtmlText;
    var resolvedUrl = responseObject.responseResolvedUrl;
    var previewImages = parseWebPageForDLsiteImage(htmlText);
    return {
        productCode: productCode,
        source: previewImages[0],
        pageUrl: resolvedUrl
    };
}

function getResponseObjectFromUrl(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false); // false = sync
    xhr.send();
    // TODO: return 404 error or error image?
    var responseObject = null;
    if (xhr.status == 200) {
        responseObject = {
            responseHtmlText: xhr.responseText,
            responseResolvedUrl: xhr.responseURL
        }
    }
    return responseObject;
}

function parseWebPageForDLsiteImage(htmlText) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlText, "text/html");
    var imageHtml = doc.querySelectorAll('[class="slider_item active"]')[0].innerHTML;
    return imageHtml.match(regexUrl);
}

// utility function
function isObjectValid(object) {
    return (typeof object !== "undefined" && object !== null)
}