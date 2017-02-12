// Preview DLsite products
browser.runtime.onMessage.addListener(preview);

function preview(request, sender, sendResponse) {
    // console logs don't work here
    removeEverything();
    sendResponse({preview: "Preview has been toggled"});
    //browser.runtime.onMessage.removeListener(preview);
}

function removeEverything() {
    while (document.body.firstChild) {
        document.body.firstChild.remove();
    }
}

