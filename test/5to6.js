'use strict';
var assert = require('assert');
describe('5to6', function() {
	it('should let me call it', function() {
		var to6 = require('../');
		assert.doesNotThrow(function() {
			to6([]);
		});
	});
	it('should have a dryRun option', function() {
		var to6 = require('../');
		assert.doesNotThrow(function() {
			to6([], {dryRun: true});
		});
	});
});
