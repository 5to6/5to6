'use strict';

var assert = require('assert');
var transform = require('../transforms/object-shorthand');
var fs = require('fs');
var espree = require('espree');
var path = require('path');

describe('object-shorthand transform', function() {
	it('should add properties & methods', function() {
		fs.readFile(path.resolve('test/fixture/object-shorthand.js'), function(err, data) {
			if (err) {
				throw err;
			}
			fs.readFile(path.resolve('test/fixture/object-shorthand.expected.js'), function(expectedErr, expected) {
				if (expectedErr) {
					throw expectedErr;
				}
				var originalAST = espree.parse(data);
				var expectedAST = espree.parse(expected);
				var transformedAST = transform(originalAST);
				assert.deepEqual(transformedAST, expectedAST);
			});
		});
	});
});
