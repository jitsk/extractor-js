/**
 * extractor_test.js - the tests cases for extractor.js
 *
 * author: R. S. Doiel, <rsdoiel@gmail>
 *
 * copyright (c) 2011 all rights reserved
 *
 * Released under New the BSD License.
 * See: http://opensource.org/licenses/bsd-license.php
 * 
 * revision 0.0.7d
 */

var TIMEOUT = 10,
    util = require('util'),
    path = require('path'),
    querystring = require('querystring'),
    assert = require('assert'),
    extractor = require('./extractor'),
    test_expected = 0,
    test_completed = 0,
    TESTS = {}, ky = '', output = [],
    display = function(msg) {
		if (msg === undefined) {
			msg = output.shift();
			while(msg) {
				console.log(msg);
				msg = output.shift();
			}
		} else {
			output.push(msg);
		}
    };

console.log("Starting [" + path.basename(process.argv[1]) + "] ... " + new Date());

// Test FetchPage()
TESTS.FetchPage = function() {
	test_expected += 1;// One test in the batch
	extractor.FetchPage('./README.md', function (err, data, pname) {
	    assert.ok(! err, "Should not get an error for reading README.md from the application directory.");
	    assert.ok(data.toString().indexOf("# Overview"), "Should get a data buffer back from README.md");
	    assert.equal(pname, './README.md', "Should have pname set to README.md");
	    test_completed += 1;
	    display("Finished FetchPage tests (" + test_completed + "/" + test_expected + ")");
	});	
};

// Test Scrape()
TESTS.Scrape = function () {
	var doc = [
		    "<!DOCTYPE html>",
		    "<html>",
		    "<head>",
		    "<title>Test 1</title>",
		    "</head>",
		    "<body>",
		    "<h1>H1 of Test 1</h1>",
		    "</body>",
		    "</html>"
	    ].join("\n"),
	    map = { title: 'title', h1: 'h1' },
	    doc2 = [
		    "<!DOCTYPE html>",
		    "<html>",
		    "<head>",
		    "<title>Test 1</title>",
		    "</head>",
		    "<body>",
		    "<div class='title'><h2>h2 Title</h2> This is more title</div>",
		    "<div class='article'>This is where an article would go.</div>",
		    "</body>",
		    "</html>"
	    ].join("\n"),
	    map2a = { title: '.title > h2', article: '.article' },
	    map2b = { title: 'div.title > h2', article: '.article'},
	    doc3 = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n\n<html xmlns="http://www.w3.org/1999/xhtml">\n\t<head>\n\t\t<meta name="keywords" content="Test, One Two Three" />\n\t\t<title>Test Page</title>\n\t</head>\n\t<body>\n\t\t<div id="site-info">This is the site information</div>\n\t\t<ul>\n\t\t<li><img id="i1" src="one.jpg" alt="dummy image 1" /></li>\n\t\t<li><img id="i2" src="two.jpg" alt="dummy image 2" /></li>\n\t\t<li><img id="i3" src="three.jpg" alt="dummy image 3" /></li>\n\t</ul>\n</body>\n</html>',
            map3 = {
		keywords: 'meta[name="keywords"]', 
		title: "title",
		image1: "#i1",
		image2: "#i2",
		image3: "#i3",
		images: "img",
		site_info: "#site-info"
            };
	
	test_expected += 1;
	extractor.Scrape("./test-data/test-1.html", map, function (err, data, pname) {
	    assert.ok(! err, "Should  not get an error. " + err);
	    assert.equal(pname, "./test-data/test-1.html", "Should have pname set to 'source code'");
	    assert.ok(typeof data === 'object', "Should have a data object");
	    assert.equal(data.title.innerHTML, "Test 1", "Title should be 'Test 1': " + JSON.stringify(data));
	    assert.equal(data.h1.innerHTML, "H1 of Test 1", "h1 should be 'H1 of Test 1': " + JSON.stringify(data));
	    test_completed += 1;
	    display("Scrape test, completed processing (" + test_completed + "/" + test_expected + ") : " + pname);
	});

	test_expected += 1;
	extractor.Scrape(doc, map, function (err, data, pname) {
	    assert.ok(! err, "Should  not get an error. " + err);
	    assert.equal(pname, undefined, "Should have pname set to ''");
	    assert.ok(typeof data === 'object', "Should have a data object");
	    assert.equal(data.title.text, "Test 1", "Title should be 'Test 1': " + JSON.stringify(data));
	    assert.equal(data.h1.innerHTML, "H1 of Test 1", "h1 should be 'H1 of Test 1': " + JSON.stringify(data));
	    test_completed += 1;
	    display("Scrape test, completed processing (" + test_completed + "/" + test_expected + ") : markup");
	});
	
	test_expected += 1;
	extractor.Scrape(doc2, map2a, function (err, data, pname) {
	    assert.ok(! err, "Should  not get an error. " + err);
	    assert.equal(pname, undefined, "Should have pname set to ''");
	    assert.ok(typeof data === 'object', "Should have a data object");
	    assert.equal(data.title.innerHTML, "h2 Title", ".title should be 'h2 Title': " + JSON.stringify(data));
	    assert.equal(data.article.innerHTML, "This is where an article would go.", ".article should be 'This is where an article would go.': " + JSON.stringify(data));
	    test_completed += 1;
	    display("Scrape test, completed processing (" + test_completed + "/" + test_expected + ") : markup");
	});

	test_expected += 1;
	extractor.Scrape(doc2, map2a, function (err, data, pname) {
	    assert.ok(! err, "Should  not get an error. " + err);
	    assert.equal(pname, undefined, "Should have pname set to ''");
	    assert.ok(typeof data === 'object', "Should have a data object");
	    assert.equal(data.title.innerHTML, "h2 Title", "div.title should be 'h2 Title': " + JSON.stringify(data));
	    assert.equal(data.article.innerHTML, "This is where an article would go.", ".article should be 'This is where an article would go.': " + JSON.stringify(data));
	    test_completed += 1;
	    display("Scrape test, completed processing (" + test_completed + "/" + test_expected + ") : markup");
	});
    
	test_expected += 1;
	extractor.Scrape(doc3, map3, function (err, data, pname) {
		assert.ok(! err, "Should not have an error: " + err);
		assert.ok(data, "Should have some data.");
		assert.equal(data.title.innerHTML, "Test Page", "Should have title: " + JSON.stringify(data));
		assert.equal(data.keywords.content, "Test, One Two Three", "Should have keywords: Test, One Two Three -> " + JSON.stringify(data));
		assert.equal(data.image1.src, "one.jpg", "Should have image one.jpg");
		assert.equal(data.image1.alt, "dummy image 1", "Should have alt text for image1");
		assert.equal(data.images[0].src, "one.jpg", "Should have image one in the first position of the array.");
		test_completed += 1;
		display("Scrape test, completed processing (" + test_completed + "/" + test_expected + ") : markup");
	});
};

// Tests of Spider()
TESTS.Spider = function () {
	test_expected += 2;
	extractor.Spider("http://nodejs.org", function (err, data, pname) {
		assert.ok(data.anchors, "Should have anchors in page.");
		assert.ok(data.images, "Should have at least the logo in the page.");
		assert.ok(data.links, "Should have some links to CSS at least.");
		test_completed += 1;
		display("Spider http://nodejs.org completed processing (" + test_completed + "/" + test_expected + ")");
	});

	extractor.Spider("test-data/test-3a.html", function (err, data, pname) {
		var expected_result = [ 'http://www.usc.edu/its/webservices/','http://nodejs.org','http://go-lang.org','http://www.google.com/chromeos','http://its.usc.edu/~rsdoiel/wscore','wscore/README.txt','http://search.npmjs.org/#/_author/R.%20S.%20Doiel','https://github.com/rsdoiel/extractor-js','https://github.com/rsdoiel/tbone','http://www.npr.org/blogs/inside/2011/02/02/126312263/behind-the-code-avoiding-spaghetti-html','https://github.com/rsdoiel/tbone','https://github.com/rsdoiel/stn','https://github.com/rsdoiel/opt','demo','https://github.com/rsdoiel','cv.html' ], i, pos, anchor;
		
		assert.ok(! err, pname + ": " + err);
		assert.ok(data.anchors, "Should have anchors in page.");
		assert.ok(data.images, "Should have at least the logo in the page.");
		assert.ok(data.links, "Should have some links to CSS at least.");
		assert.equal(expected_result.length, data.anchors.length, "Should have same lengths: " + expected_result.length + " != " + data.anchors.length);

		data.anchors.forEach(function (anchor) {
			assert.ok(anchor.href, "Should have anchor.href for test-3a.html");
			pos = expected_result.indexOf(anchor.href);
			assert.ok(pos >= 0, "Should find " + anchor.href + " in expected array.");
			if (pos >= 0) {
				assert.ok(expected_result.splice(pos,1), "Should be able to remove " + pos + " position in expected array.");
			}
		});
		assert.equal(expected_result.length, 0, "elements left over: " + JSON.stringify(expected_result));		
		test_completed += 1;
		display("Spider test-data/test-3a.html completed processing (" + test_completed + "/" + test_expected + ")");
	});	
};

// Tests of SubmitForm()
TESTS.SubmitForm = function () {
	// http GET
	test_expected += 1;
	(function () {
		var hostname, pathname, uri, form_data, form_options = { method:'GET' };

		form_data = { s:'npm', searchsubmit:'Search' };
		hostname = 'blog.nodejs.org';
		pathname = '';
		uri = ['http:/', hostname, pathname].join('/');
		display("Running SubmitForm test " + uri);
		extractor.SubmitForm(uri, form_data, function (err, data, options) {
			assert.ok(! err, uri + ": " + err);
			assert.ok(data, hostname + " should get some data back.");
			assert.ok(data.match(/<\/html>/), hostname + " should get the end of the html page response.");
			assert.equal(options.protocol, 'http:', hostname + " should have an http: for protocol.");
			assert.equal(options.host, hostname, hostname + "should have host blog.nodejs.org.");
			assert.equal(options.port, 80, hostname + " should have port 80");
			assert.equal(options.path, ('/' + pathname + '?' + querystring.encode(form_data)), uri + " should have path " + pathname + ": " + options.path);
			assert.equal(options.method, 'GET', hostname + " should have path GET");
			assert.equal(options.timeout, 30000, hostname + " should have 30000 for timeout.");		
			test_completed += 1;
			display("SubmitForm " + uri + " completed processing (" + test_completed + "/" + test_expected + ")");
		}, form_options);
	}());

	// https GET
	test_expected += 1;
	(function () {
		var hostname, pathname, uri, form_data, form_options = { method:'GET' };

		form_options = { method:'GET' };
		form_data = { q: 'extractor-js' };
		hostname = 'github.com';
		pathname = 'search';
		uri = ['https:/', hostname, pathname].join('/');
		display("Running SubmitForm test " + uri);
		extractor.SubmitForm(uri, form_data, function (err, data, options) {
			assert.ok(! err, uri + ": " + err);
			assert.ok(data, hostname + " should get some data back.");
			assert.ok(data.match(/<\/html>/), hostname + " should get the end of the html page response.");
			assert.equal(options.protocol, 'https:', hostname + " should have an http: for protocol.");
			assert.equal(options.host, hostname, hostname + " should have host github.com");
			assert.equal(options.port, 443, hostname + " should have port 443");
			assert.equal(options.path, ('/' + pathname + '?' + querystring.encode(form_data)), hostname + " should have path " + pathname + ": " + options.path);
			assert.equal(options.method, 'GET', hostname + " should have path GET");
			assert.equal(options.timeout, 30000, hostname + " should have 30000 for timeout.");		
			test_completed += 1;
			display("SubmitForm " + uri + " completed processing (" + test_completed + "/" + test_expected + ")");
		}, form_options);
	}());

	
	// http POST
	// https POST	
	// FIXME: Need to come up with public sites I can test against
};

// Run the tests and keep track of what passed
for (ky in TESTS) {
	if (typeof TESTS[ky] === 'function') {
		console.log("Starting " + ky + "() ...");
		TESTS[ky]();
	}
}
var waiting = 0;
setInterval(function () {
	display();
	if (test_expected === test_completed) {
		console.log("Success! " + new Date());
		process.exit(0);
	}
	waiting += 1;
	if (waiting > TIMEOUT) {
		console.error("Failed, timed out for incomplete tests " + test_completed + "/" + test_expected + ". " + new Date());
		process.exit(1);
	}
}, 1000);
