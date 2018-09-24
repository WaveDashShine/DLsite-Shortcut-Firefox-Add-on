// Preview DLsite products
// sendResponse only works once
// requires the onMessage Listener
chrome.runtime.onMessage.addListener(handleRequestData);

function handleRequestData(request, sender, sendResponse) {
    switch (request.action) {
        case "previewGetMatches":
            sendMatchesResponse(request, sender, sendResponse);
            break;
        case "previewInsertImage":
            insertImage(request, sender, sendResponse);
            //chrome.runtime.onMessage.removeListener(handleRequestData);
            break;
        default:
            alert("ERROR: request data was not handled correctly");
    }
}

function sendMatchesResponse(request, sender, sendResponse) {
    console.log(request.regex);
    var matchArray = document.body.textContent.match(new RegExp(request.regex, "gi"));
    console.log("matchArray Preview.js = " + matchArray);
    if (isObjectValid(matchArray)) {
        sendResponse({
            action: request.action,
            matches: matchArray
        })
    }
}

function insertImage(request, sender, sendResponse) {
    if (isObjectValid(request.imageObject.productCode) &&
        isObjectValid(request.imageObject.source) &&
        isObjectValid(request.imageObject.pageUrl)) {
        walk(document.body, request);
    }
    //sendResponse({action: request.action});
}

/*
WALKS THROUGH DOCUMENT AND HANDLES ONLY VISIBLE TEXT ON PAGE
Following code referenced from stackoverflow.com
/questions/5904914/javascript-regex-to-replace-text-not-in-html-attributes/5904945#5904945
 */
function walk(node, request) {
    var child, next;

    switch (node.nodeType) {
        case 1:  // Element
        case 9:  // Document
        case 11: // Document fragment
            child = node.firstChild;
            while (child) {
                next = child.nextSibling;
                walk(child, request);
                child = next;
            }
            break;
        case 3: // Text node
            if (node.parentElement.tagName.toLowerCase() !== "script" &&//XSS protection
                node.parentElement.tagName.toLowerCase() !== "a") {
                var textNodeMatches = node.nodeValue.match(request.imageObject.productCode);
                if (isObjectValid(textNodeMatches)) {
                    insertPreviewImageAtText(node, request);
                }
            }
            break;
    }
}

/* HANDLE TEXT MODIFIES THE TEXT CONTENT OF A WEBPAGE TO ISNERT DLSITE IMAGES
1) Inserts image before the text appearance
2) Image links to DLsite Page
 */
function insertPreviewImageAtText(textNode, request) {
    var textNodeMatches = textNode.nodeValue.match(request.imageObject.productCode);
    if (isObjectValid(textNodeMatches)) {
        var splitNode = textNode.splitText(textNode.nodeValue.indexOf(textNodeMatches[0]));
        var previewImageLink = createImageLinkFromDLsiteImageData(request.imageObject);
        textNode.parentNode.insertBefore(previewImageLink, splitNode);
    }
}

/* CREATES CLICKABLE IMAGE LINKING TO DLSITE
1) requires image data with IMG "source" and "pageURL" LINK
2) returns the HTML image element with src attribute
 */
function createImageLinkFromDLsiteImageData(imageObj) {
    var previewImage = document.createElement("img");
    var previewLink = document.createElement("a");
    previewImage.setAttribute("src", "https://" + imageObj.source);
    previewLink.setAttribute("href", imageObj.pageUrl);
    previewLink.setAttribute("rel", "noreferrer");
    previewLink.appendChild(previewImage);
    return previewLink;
}

// will not be using import for injected javascript so duplicated utility function here
function isObjectValid(object) {
    return (typeof object !== "undefined" && object !== null)
}


