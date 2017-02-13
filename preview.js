// Preview DLsite products
// sendResponse only works once
// requires the onMessage Listener
// console log doesn't work here
browser.runtime.onMessage.addListener(preview);

function preview(request, sender, sendResponse) {
    //removeEverything();
    var matchArray = matchCodes(request.regex);
    if (matchArray !== typeof "undefined" && matchArray !== null){
        loadPreviews(matchArray);
    }
    sendResponse({preview: matchArray.toString()});
    browser.runtime.onMessage.removeListener(preview);
}

function matchCodes(regex){
    return document.body.textContent.match(regex);
}

function loadPreviews(array){
    for (var i = 0; i < array.length; i++) {
        if(array[i].toUpperCase().includes("G")){
            //stub
        } else {
            // stub
        }
    }
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


/* BLANKS THE PAGE
1) verifies that the script has been loaded since console.log() doesn't work
 */
function removeEverything() {
    while (document.body.firstChild) {
        document.body.firstChild.remove();
    }
}

