'use strict';

var assert = require('assert');
var transform = require('../transforms/cjs');
var fs = require('fs');
var espree = require('espree');
var path = require('path');

describe('cjs transform', function() {
	it('should convert require() statements to import & module.export to export default', function(done) {
		fs.readFile(path.resolve('test/fixture/cjs.js'), function(err, data) {
			if (err) {
				throw err;
			}
			fs.readFile(path.resolve('test/fixture/cjs.expected.js'), function(expectedErr, expected) {
				if (expectedErr) {
					throw expectedErr;
				}
				var originalAST = espree.parse(data);
				var expectedAST = espree.parse(expected, { ecmaFeatures: { modules: true }});
				var transformedAST = transform(originalAST);
				assert.deepEqual(transformedAST, expectedAST);
				done();
			});
		});
	});
});
