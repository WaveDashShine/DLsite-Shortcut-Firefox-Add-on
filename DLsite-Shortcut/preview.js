// Preview DLsite products
// sendResponse only works once
// requires the onMessage Listener
// console log doesn't work here
chrome.runtime.onMessage.addListener(handleRequestData);

var regexDLsite;
var images;
// found the URL regex online, removed the query strings since those are irrelevant for our purposes
var regexUrl = /\b((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+)\b/;

/*

 */
function handleRequestData(request, sender, sendResponse){
    switch (request.action){
        case "previewGetMatches":
            // TODO: handle match arrays
            sendDocument(request, sender, sendResponse);
            break;
        case "previewInsertImage":
            insertImage(request, sender, sendResponse);
            chrome.runtime.onMessage.removeListener(handleRequestData);
            break;
        default:
            alert("ERROR: request data was not handled correctly");
    }
}

/*/

 */
function sendDocument(request, sender, sendResponse){
    // stub
    sendResponse({
        action: request.action,
        documentTextContent: document.body.textContent
    });
}

/*

 */
function insertImage(request, sender, sendResponse) {
    initializeGlobalVariables(request);
    walk(document.body);
    sendResponse({action: request.action});
}
/*

 */
function initializeGlobalVariables(request){
    regexDLsite = request.regex;
    images = request.images;
}

/* WALKS THROUGH DOCUMENT AND HANDLES ONLY VISIBLE TEXT ON PAGE
Following code referenced from stackoverflow.com
/questions/5904914/javascript-regex-to-replace-text-not-in-html-attributes/5904945#5904945
 */
function walk(node) {
    var child, next;

    switch (node.nodeType) {
        case 1:  // Element
        case 9:  // Document
        case 11: // Document fragment
            child = node.firstChild;
            while (child) {
                next = child.nextSibling;
                walk(child);
                child = next;
            }
            break;
        case 3: // Text node
            if(node.parentElement.tagName.toLowerCase() != "script") { //XSS protection
                insertPreviewImageAtText(node);
            }
            break;
    }
}

/* HANDLE TEXT MODIFIES THE TEXT CONTENT OF A WEBPAGE TO ISNERT DLSITE IMAGES
1) Inserts image before the text appearance
2) Image links to DLsite Page
 */
// TODO: does not handle multiple matches within a single text node
// TODO: does not handle group codes
function insertPreviewImageAtText(textNode) {
    var textNodeMatches = textNode.nodeValue.match(regexDLsite);
    if (typeof textNodeMatches !== "undefined" && textNodeMatches !== null){
        var splitNode = textNode.splitText(textNode.nodeValue.indexOf(textNodeMatches[0]));
        var imageObj = getMatchingImageObjectFromArray(textNodeMatches[0].toUpperCase());
        var previewImageLink = createImageLinkFromDLsiteImageData(imageObj);
        textNode.parentNode.insertBefore(previewImageLink, splitNode);
    }
}

/*
TODO: THIS METHOD IS TOO SLOW
 */
function getMatchingImageObjectFromArray(productCode){
    for (i = 0; i < images.length; i++){
        if (productCode == images[i].productCode){
            return images[i];
        }
    }
}

/* CREATES CLICKABLE IMAGE LINKING TO DLSITE
1) requires image data with IMG "source" and "pageURL" LINK
2) returns the HTML image element with src attribute
 */
function createImageLinkFromDLsiteImageData(imageObj){
    var previewImage = document.createElement("img");
    var previewLink = document.createElement("a");
    previewImage.setAttribute("src", "https://" + imageObj.source);
    previewLink.setAttribute("href", imageObj.pageUrl);
    return previewLink.appendChild(previewImage);
}


