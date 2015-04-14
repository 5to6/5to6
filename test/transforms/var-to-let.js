'use strict';

var assert = require('assert');
var transform = require('../../transforms/var-to-let');
var fs = require('fs');
var espree = require('espree');
var path = require('path');

describe('var-to-let transform', function() {
	it('should convert var to let', function(done) {
		fs.readFile(path.resolve('test/fixture/var-to-let.js'), function(err, data) {
			if (err) {
				throw err;
			}
			fs.readFile(path.resolve('test/fixture/var-to-let.expected.js'), function(expectedErr, expected) {
				if (expectedErr) {
					throw expectedErr;
				}
				var originalAST = espree.parse(data);
				var expectedAST = espree.parse(expected, { ecmaFeatures: { blockBindings: true }});
				var transformedAST = transform(originalAST);
				assert.deepEqual(transformedAST, expectedAST);
				done();
			});
		});
	});
});
