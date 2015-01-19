var WikiPath = require("../routes/wikipath.js");
var assert = require("assert");

describe("WikiPath", function(){
	describe("#constructor()", function(){
		it("should nomalize url", function(){
			//Given
			//When
			var path = new WikiPath("/FrontPage/");
			//Then
			assert.equal(path.full, "/FrontPage");
		});
		it("should nomalize url '/' as '/'", function(){
			//Given
			//When
			var path = new WikiPath("/");
			//Then
			assert.equal(path.full, "/");
		});
		it("should normalize url with space", function(){
			//Given
			//When
			var path = new WikiPath("/test/path with space");
			//Then
			assert.equal(path.full, "/test/path with space");

		});
		it("should normalize url with encoded space", function(){
			//Given
			//When
			var path = new WikiPath("/test/path%20with%20space");
			//Then
			assert.equal(path.full, "/test/path with space");

		});
		it("should parse note name and dir path", function(){
			//Given
			//When
			var path = new WikiPath("/test/path/to/note");
			//Then
			assert.equal(path.path, "/test/path/to");
			assert.equal(path.name, "note");
		});
	});
	describe("#toString()", function(){
		it("should return full path", function(){
			//Given
			//When
			var path = new WikiPath("/FrontPage/");
			//Then
			assert.equal(path.toString(), "/FrontPage");
		});
		it("should automatically stringify", function(){
			//Given
			//When
			var path = new WikiPath("/FrontPage/");
			//Then
			assert.equal(path + "", "/FrontPage");
			assert.equal("" + path, "/FrontPage");
		});
	});
	describe("#toArray()", function(){
		it("should split path with '/'", function(){
			//Given
			var path = new WikiPath("/test/path/to");
			//When
			var array = path.toArray();
			//Then
			assert.deepEqual(array, ["test", "path", "to"]);
		});
		it("should return empty array on '/'", function(){
			//Given
			var path = new WikiPath("/");
			//When
			var array = path.toArray();
			//Then
			assert.deepEqual(array, []);
		});
	});
	describe("#bread()", function(){
		it("should return breadcrumb util data", function(){
			//Given
			var path = new WikiPath("/test/path");
			//When
			var breadcrumb = path.bread();
			//Then
			assert.deepEqual(breadcrumb, [{name :"test", path : "/test"}, { name : "path", path : "/test/path"}]);
		});
	});
	describe("#encode()", function(){
		it("should encode space", function(){
			//Given
			var path = new WikiPath("/test/path with space");
			//When
			var str = path.encode();
			//Then
			assert.equal(str, "%2Ftest%2Fpath%20with%20space");
		});
		it("should encode hangul", function(){
			//Given
			var path = new WikiPath("/test/path-with-한글");
			//When
			var str = path.encode();
			//Then
			assert.equal(str, "%2Ftest%2Fpath-with-%ED%95%9C%EA%B8%80");
		});
	});
	//Given
	//When
	//Then
});
