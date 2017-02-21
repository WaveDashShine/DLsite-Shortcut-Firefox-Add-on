// Preview DLsite products
// sendResponse only works once
// requires the onMessage Listener
// console log doesn't work here
chrome.runtime.onMessage.addListener(preview);

var regexDLsite;
var dlsiteProductUrl;
var dlsiteGroupUrl;
// found the URL regex online, removed the query strings since those are irrelevant for our purposes
var regexUrl = /\b((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+)\b/;

function preview(request, sender, sendResponse) {
    // TODO: initialize global variables function(response)
    regexDLsite = request.regex;
    dlsiteProductUrl = request.dlsiteProductUrl;
    dlsiteGroupUrl = request.dlsiteGroupUrl;
    // consider using another method to verify that body contains DLsite codes
    var matchArray = document.body.textContent.match(regexDLsite);
    if (typeof matchArray !== "undefined" && matchArray !== null){
        walk(document.body);
    }
    sendResponse({preview: matchArray.toString()});
    chrome.runtime.onMessage.removeListener(preview);
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
            if(node.parentElement.tagName.toLowerCase() != "script") {
                handleText(node);
            }
            break;
    }
}

/* HANDLE TEXT MODIFIES THE TEXT CONTENT OF A WEBPAGE TO ISNERT DLSITE IMAGES
1) Inserts image before the text appearance
2) Image links to DLsite Page
 */
// TODO: does not handle multiple matches within a text node
// TODO: does not handle group codes
function handleText(textNode) {
    var textNodeMatches = textNode.nodeValue.match(regexDLsite);
    if (typeof textNodeMatches !== "undefined" && textNodeMatches !== null){
        var splitNode = textNode.splitText(textNode.nodeValue.indexOf(textNodeMatches[0]));
        // TODO: refactor creating element to smaller helper methods
        var previewImage = document.createElement("IMG");
        var previewLink = document.createElement("A");
        var imageObj = getDLsiteProductImageSrc(dlsiteProductUrl + textNodeMatches[0].toUpperCase());
        previewImage.setAttribute("src", "https://"+imageObj.source);
        previewLink.setAttribute("href", imageObj.pageUrl);
        previewLink.appendChild(previewImage);
        textNode.parentNode.insertBefore(previewLink, splitNode);
    }
}
/* GETS THE IMAGE SOURCE IF IT IS A PROUDCT
1) XHR to DLsite URL
2) Parses HTML to find product image
3) returns the src to the product image
*) DOES NOT WORK ON SOME SITES DUE TO CROSS ORIGIN POLICY
 */
function getDLsiteProductImageSrc(url){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false); // false = sync
    xhr.send();
    if (xhr.status == 200){
        var xhrText = xhr.responseText;
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhrText, "text/html");
        var imageHtml = doc.querySelectorAll('[class="slider_item active"]')[0].innerHTML;
        var imageSrc = imageHtml.match(regexUrl);
        return {
            source: imageSrc[0],
            pageUrl:xhr.responseURL
        };
    } else {
        // TODO: return 404 error or error image?
        return "";
    }
}
