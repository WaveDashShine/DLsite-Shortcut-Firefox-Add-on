describe("tests stub", function () {
    it("should always pass", function () {
        expect(true).toBe(true);
    });
});

describe("array function", function () {
    var productCodeArray = ["RE091090", "RE091090", "RG15719", "RE091090", "RG15719"];
    var arrayNoDuplicates = removeDuplicatesFromArray(productCodeArray);
    it("duplicates should be removed from array", function () {
        expect(arrayNoDuplicates.length).toBe(2);
        expect(arrayNoDuplicates.includes("RE091090")).toBe(true);
        expect(arrayNoDuplicates.includes("RG15719")).toBe(true);
    });
});

describe("get request for image data from product code", function () {
    var productCode = "RE091090";
    var responseHTML = "<li class=\"slider_item active\" style=\"width: 759px;\"><img itemprop=\"image\" src=\"//img.dlsite.jp/modpub/images2/work/doujin/RJ092000/RJ091090_img_main.jpg\"></li>";
    var generatedPageUrl = dlsiteProductUrl + productCode;
    var expectedImageUrl = "img.dlsite.jp/modpub/images2/work/doujin/RJ092000/RJ091090_img_main.jpg";

    // need ajax to mock xml http requests
    beforeEach(function() {
        jasmine.Ajax.install();

        jasmine.Ajax.stubRequest(generatedPageUrl).andReturn({
            "status": 200,
            "contentType": "text/html",
            "responseText": responseHTML,
            "responseURL": "http://www.dlsite.com/eng/work/=/product_id/RE091090.html"
        });
    });

    // uninstall in case other specs need to make requests
    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    it("image objects are parsed from array", function () {
        var productCodeArray = [productCode];
        var imageData = getDLsiteProductCodeImageData(productCode);
        spyOn(window, "getImageObjectsFromMatchArray").and.callThrough();
        spyOn(window, "sendRequestToActiveTab");

        getImageObjectsFromMatchArray(productCodeArray);
        expect(window.getImageObjectsFromMatchArray).toHaveBeenCalledWith(productCodeArray);

        var activeTabParamters = {
            action: "previewInsertImage",
            imageObject: imageData
        };
        expect(window.sendRequestToActiveTab).toHaveBeenCalledWith(activeTabParamters);
    });

    it("html can be parsed for image url", function () {
        var imageUrl = parseWebPageForDLsiteImage(responseHTML);
        expect(imageUrl[0]).toBe(expectedImageUrl);
    });

    it("response object obtained from url", function () {
        var responseObject = getResponseObjectFromUrl(generatedPageUrl);
        expect(responseObject.responseHtmlText).toBe(responseHTML);
        expect(responseObject.responseResolvedUrl).toContain(productCode);
        expect(responseObject.responseResolvedUrl).toContain("dlsite");
    });

    it("get data from DLsite with product code", function () {
        var imageData = getDLsiteProductCodeImageData(productCode);

        expect(jasmine.Ajax.requests.mostRecent().url).toContain(productCode);
        expect(jasmine.Ajax.requests.mostRecent().url).toContain("dlsite");

        expect(imageData.productCode).toBe(productCode);
        expect(imageData.pageUrl).toContain(productCode);
        expect(imageData.pageUrl).toContain("dlsite");
        expect(imageData.source).toBe(expectedImageUrl);
    });
});

describe("invalid objects are invalid", function () {
    it("undefined is invalid", function () {
        expect(isObjectValid()).toBe(false);
    });

    it("null is invalid", function () {
        expect(isObjectValid(null)).toBe(false);
    });
});

describe("Image preview", function () {
    it("image preview contains data from image object", function () {
        var pageUrl = "fakeurl";
        var imageLink = "fakeimage";
        var imageData = {
            productCode: "RE091090",
            source: imageLink,
            pageUrl: pageUrl
        };
        var previewLink = createImageLinkFromDLsiteImageData(imageData);
        var previewImage = previewLink.childNodes[0];

        expect(previewLink.nodeName).toBe("A");
        expect(previewLink.rel).toBe("noreferrer");
        expect(previewLink.href).toContain(pageUrl);
        expect(previewLink.childElementCount).toBe(1);
        expect(previewImage.src).toContain(imageLink);
        expect(previewImage.nodeName).toBe("IMG");
    });
});

// TODO: insert image -> walk
// create dummy request object and have a field with imageObject and associated data

// TODO: insert preview images

// TODO: sendRequestToActiveTab -> may need ajax

// TODO: open DLsite page function

// TODO: send matches response