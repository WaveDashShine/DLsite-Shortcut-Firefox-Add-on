// Preview DLsite products
// sendResponse only works once
// requires the onMessage Listener
// console log doesn't work here
browser.runtime.onMessage.addListener(preview);

var regexDLsite;

function preview(request, sender, sendResponse) {
    regexDLsite = request.regex;
    // TODO performance for verification step (this step takes too much nonsense)
    // global variable for match array?
    // why wouldn't you just have some other way to verify it here if this takes too long
    // because you don't really need the match array for anything else
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

// How to replace text with HTML element?
// split? create element? we can't use textnode right? splitText?
// splitText and normalize can be used to split text nodes and concat them
function handleText(textNode) {
    // use recursion instead of FOR LOOP?
    var tempNode = textNode;
    var textNodeMatches = tempNode.nodeValue.match(regexDLsite);
    if (textNodeMatches !== typeof "undefined" && textNodeMatches !== null){
        for (i = 0; i < textNodeMatches.length; i++) {
            var splitNode = tempNode.splitText(tempNode.nodeValue.indexOf(textNodeMatches[i])); // stub
            var btn = document.createElement("BUTTON"); // stub
            btn.appendChild(document.createTextNode("TESTING")); // stub
            textNode.parentNode.insertBefore(btn, splitNode);

        }
    }

    //var test = "<h1>test</h1>";
    //textNode.nodeValue = textNode.nodeValue.replace(regexDLsite, test);
}

function getOffsetOfMatches(){
    //stub
}