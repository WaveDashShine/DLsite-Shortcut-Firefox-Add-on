describe("background tests stub", function () {
    it("should always pass", function () {
        expect(true).toBe(true);
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

describe("get image data for RE091090", function () {

    var productCode = "RE091090";
    var responseHTML = "<li class=\"slider_item active\" style=\"width: 759px;\"><img itemprop=\"image\" src=\"//img.dlsite.jp/modpub/images2/work/doujin/RJ092000/RJ091090_img_main.jpg\"></li>";
    var expectedPageUrl = dlsiteProductUrl + productCode;
    var expectedImageUrl = "img.dlsite.jp/modpub/images2/work/doujin/RJ092000/RJ091090_img_main.jpg";

    // need ajax to mock xml http requests
    beforeEach(function() {
        jasmine.Ajax.install();
    });

    // uninstall in case other specs need to make requests
    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    it("get data from DLsite", function () {
        jasmine.Ajax.stubRequest(expectedPageUrl).andReturn({
            "status": 200,
            "contentType": "text/html",
            "responseText": responseHTML,
            "responseURL": "http://www.dlsite.com/eng/work/=/product_id/RE091090.html"
        });

        var imageData = getDLsiteProductCodeImageData(productCode);

        expect(jasmine.Ajax.requests.mostRecent().url).toContain(productCode);
        expect(jasmine.Ajax.requests.mostRecent().url).toContain("dlsite");

        expect(imageData.productCode).toBe(productCode);
        expect(imageData.pageUrl).toContain(productCode);
        expect(imageData.pageUrl).toContain("dlsite");
        expect(imageData.source).toBe(expectedImageUrl);
    });
});

