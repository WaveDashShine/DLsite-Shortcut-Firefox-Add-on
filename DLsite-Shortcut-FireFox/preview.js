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

// TODO: does not handle multiple matches within a text node
function handleText(textNode) {
    var textNodeMatches = textNode.nodeValue.match(regexDLsite);
    if (textNodeMatches !== typeof "undefined" && textNodeMatches !== null){
        var splitNode = textNode.splitText(textNode.nodeValue.indexOf(textNodeMatches[0]));
        var btn = document.createElement("IMG"); // stub
        btn.setAttribute("src", "https://img.dlsite.jp/modpub/images2/work/doujin/RJ182000/RJ181758_img_main.jpg");
        textNode.parentNode.insertBefore(btn, splitNode);
        getDLsiteImage();
    }
}

function getProductImage(productCode){
    // stub
}

function getGroupImage(groupCode){
    // stub
}

function getDLsiteImage(){
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) { // readyState 4 == DONE
            // stub
            var xhrText = xhr.responseText; // returns truncated response
            var parser = new DOMParser();
            var doc = parser.parseFromString(xhrText, "text/xml");
            var imageURL = doc.getElementsByClassName("slider_item_active").src;
            var i = imageURL;
            //document.getElementsByClassName("slider_item active");
        }
    };
    var testURL = "http://www.dlsite.com/eng/work/=/product_id/RE158551";
    xhr.open("GET", testURL, true);
    xhr.send();
}

function removePreviews(){
    // stub
}