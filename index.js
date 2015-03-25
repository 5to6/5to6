var async = require('async');
var fs = require('fs');
var path = require('path');
var espree = require('espree');
var escodegen = require('escodegen');
var startTime = Date.now();
var transforms = require('requireindex')('./transforms');

/**
 * Display a report based on what happened during the running of the program.
 * @param err {Error}
 * @param files {Array}
 */
function report(err, files) {
	if (err) {
		console.error(err);
		return;
	}
	console.log("Applied " + Object.keys(transforms).length + " transforms to " + files.length + " file(s) in " + (Date.now() - startTime) + " ms.");
}

/**
 * Apply all of the available transforms to a single file.
 * @param filename {String}
 * @param callback {Function}
 */
function applyTransforms(filename, callback) {
	fs.readFile(path.resolve(filename), { encoding: 'utf8' }, function(err, data) {
		var ast, out, transform;
		if (err) return callback(err);
		try {
			ast = espree.parse(data);
		} catch (e) {
			return callback(e);
		}

		// not sure if these are all sync or not
		for (transform in transforms) {
			ast = transforms[transform](ast);
		}

		out = escodegen.generate(ast);

		callback(null, out);
	});
}

/**
 * Apply transforms to each files
 * @param files {Array}
 */
module.exports = function(files) {
	async.each(files, applyTransforms, function(err) {
		report(err, files)
	});
}
