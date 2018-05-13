describe("preview tests stub", function () {
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