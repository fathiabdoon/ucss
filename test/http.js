/* jshint: */
/*global setTimeout public_functions assert require fs:true sinon:true */

fs = require("fs");

if (typeof require !== "undefined") {
    var buster = require("buster");
    var lib = require("../lib/ucss");
}


buster.testCase("uCSS (using http)", {
    setUp: function () {
        var http = require("http");

        this.server = http.createServer(function (req, res) {
            if ("/markup1.html" === req.url) {
                res.end("<html><head></head><body class='foo'></body></html>");
            } else if ("/markup2.html" === req.url) {
                res.end("<html><head></head><body class='bar'></body></html>");
            } else if ("/rules1.css" === req.url) {
                res.end(".foo {} .bar {}");
            } else if ("/rules2.css" === req.url) {
                res.end(".baz {}");
            } else {
                res.writeHead(404);
                res.end();
            }
        }).listen(9988, "0.0.0.0");
    },

    tearDown: function () {
        this.server.close();
    },

    "can load and process resources": function(done) {
        var markup = ["http://127.0.0.1:9988/markup1.html",
                      "http://127.0.0.1:9988/markup2.html"];
        var css = ["http://127.0.0.1:9988/rules1.css",
                   "http://127.0.0.1:9988/rules2.css"];

        var expected = {};
        expected.used = {};
        expected.used[".bar"] = 1;
        expected.used[".baz"] = 0;
        expected.used[".foo"] = 1;
        expected.duplicates = {};

        lib.analyze(css, markup, null, null, function(result) {
            assert.equals(result.used, expected.used);
            assert.equals(result.duplicates, expected.duplicates);
            done();
        });
    }
});
