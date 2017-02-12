// Preview DLsite products
browser.runtime.onMessage.addListener(preview);

function preview(request, sender, sendResponse) {
    //removeEverything();
    sendResponse({preview: "Preview has been toggled"});
    browser.runtime.onMessage.removeListener(preview);
}

function matchCodes(){
    // stub
}

function loadPreviews(){
    // stub
}

function removePreviews(){
    // stub
}


/* BLANKS THE PAGE
1) verifies that the script has been loaded since console.log() doesn't work
 */
function removeEverything() {
    while (document.body.firstChild) {
        document.body.firstChild.remove();
    }
}

