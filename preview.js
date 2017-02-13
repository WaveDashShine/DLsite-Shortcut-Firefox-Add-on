// Preview DLsite products
// sendResponse only works once
// requires the onMessage Listener
// console log doesn't work here
browser.runtime.onMessage.addListener(preview);

var regexDLsite;

function preview(request, sender, sendResponse) {
    regexDLsite = request.regex;
    var matchArray = document.body.textContent.match(regexDLsite);
    if (matchArray !== typeof "undefined" && matchArray !== null){
        walk(document.body);
    }
    sendResponse({preview: matchArray.toString()});
    browser.runtime.onMessage.removeListener(preview);
}

function getProductImage(produceCode){
    // stub
}

function getGroupImage(groupCode){
    // stub
}

function loadDLsiteDocument(){
    //stub
}

function removePreviews(){
    // stub
}

/* WALKS THROUGH DOCUMENT AND HANDLES ONLY VISIBLE TEXT ON PAGE
Following code referenced from stackoverflow.com
/questions/5904914/javascript-regex-to-replace-text-not-in-html-attributes/5904945#5904945
 */
function walk(node, regex) {
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
            handleText(node, regex);
            break;
    }
}

function handleText(textNode) {
    textNode.nodeValue = textNode.nodeValue.replace(regexDLsite, "TEST");
}
