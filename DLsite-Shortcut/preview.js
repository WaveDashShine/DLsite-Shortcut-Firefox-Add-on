// Preview DLsite products
// sendResponse only works once
// requires the onMessage Listener
chrome.runtime.onMessage.addListener(handleRequestData);

/*

 */
function handleRequestData(request, sender, sendResponse){
    switch (request.action){
        case "previewGetMatches":
            // TODO: handle match arrays
            sendMatches(request, sender, sendResponse);
            break;
        case "previewInsertImage":
            insertImage(request, sender, sendResponse);
            // TODO: remove listener?
            //chrome.runtime.onMessage.removeListener(handleRequestData);
            break;
        default:
            alert("ERROR: request data was not handled correctly");
    }
}

/*

 */
function sendMatches(request, sender, sendResponse){
    console.log(request.regex);
    var matchArray = document.body.textContent.match(new RegExp(request.regex, "gi"));
    console.log("matchArray Preview.js = " + matchArray);
    if (typeof matchArray !== "undefined" && matchArray !== null){
        var uniqueMatches = removeDuplicatesFromArray(matchArray);
        console.log("uniqueMatches Preview.js = " + uniqueMatches);
        sendResponse({
            action: request.action,
            matches: uniqueMatches
        })
    }
}

/*

 */
function removeDuplicatesFromArray(array){
    var tempSet = new Set();
    for (i =0; i < array.length; i++){
        tempSet.add(array[i]);
    }
    return Array.from(tempSet);
}

/*/
DEPRECATED
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
// TODO: insert dummy images when its loading
function insertImage(request, sender, sendResponse) {
    if (typeof request.imageObject.productCode !== "undefined" && request.imageObject.productCode !== null &&
        typeof request.imageObject.source !== "undefined" && request.imageObject.source !== null &&
        typeof request.imageObject.pageUrl !== "undefined" && request.imageObject.pageUrl !== null){
        walk(document.body, request);
    }

    //sendResponse({action: request.action});
}

/* WALKS THROUGH DOCUMENT AND HANDLES ONLY VISIBLE TEXT ON PAGE
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
            if(node.parentElement.tagName.toLowerCase() != "script") { //XSS protection
                var textNodeMatches = node.nodeValue.match(request.imageObject.productCode);
                if (typeof textNodeMatches !== "undefined" && textNodeMatches !== null){
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
// TODO: does not handle multiple matches within a single text node
// TODO: does not handle group codes
function insertPreviewImageAtText(textNode, request) {
    var textNodeMatches = textNode.nodeValue.match(request.imageObject.productCode);
    if (typeof textNodeMatches !== "undefined" && textNodeMatches !== null){
        var splitNode = textNode.splitText(textNode.nodeValue.indexOf(textNodeMatches[0]));
        var previewImageLink = createImageLinkFromDLsiteImageData(request.imageObject);
        textNode.parentNode.insertBefore(previewImageLink, splitNode);
    }
}

/* CREATES CLICKABLE IMAGE LINKING TO DLSITE
1) requires image data with IMG "source" and "pageURL" LINK
2) returns the HTML image element with src attribute
 */
// TODO: only image is displayed, no link
function createImageLinkFromDLsiteImageData(imageObj){
    var previewImage = document.createElement("img");
    var previewLink = document.createElement("a");
    previewImage.setAttribute("src", "https://" + imageObj.source);
    previewLink.setAttribute("href", imageObj.pageUrl);
    previewLink.appendChild(previewImage);
    return previewLink;
}


