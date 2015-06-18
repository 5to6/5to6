/**
 * 5to6 - Take your project into the future.
 */

'use strict';

var async = require('async');
var fs = require('fs');
var path = require('path');
var espree = require('espree');
var escodegen = require('escodegen');
var startTime = Date.now();
var transforms = require('requireindex')(path.join(__dirname, 'transforms'));
// var util = require('util');

/**
 * Display a report based on what happened during the running of the program.
 * @param err {Error}
 * @param files {Array}
 */
function report(err, files) {
	if (err) {
		return console.error(err.stack);
	}
	console.log('Applied ' + Object.keys(transforms).length + ' transforms to ' + files.length + ' file(s) in ' + (Date.now() - startTime) + ' ms.');
}

/**
 * Apply all of the available transforms to a single file.
 * @param options.filename {String}
 * @param options.outDir {String}
 * @param callback {Function}
 */
function applyTransforms(options, callback) {
	var filename = options.filename;
	var outDir = options.outDir;

	fs.readFile(path.resolve(filename), { encoding: 'utf8' }, function(err, data) {
		var ast, out, transform;
		if (err) {
			return callback(err);
		}
		try {
			ast = espree.parse(data, {
				attachComment: true,
				loc: true,
				range: true,
				tokens: true
			});
		} catch (e) {
			return callback(new Error('Error parsing ' + filename));
		}

		// not sure if these are all sync or not
		for (transform in transforms) {
			ast = transforms[transform](ast);
		}

		try {
			out = escodegen.generate(ast, {
				comment: true,
				format: {
					preserveBlankLines: true, // TODO: make this actually work
					indent: {
						style: '\t', // TODO: make this all customizable
						adjustMultilineComment: true
					}
				}

			});
		} catch(e) {
			return callback(e);
		}

		var outfile = path.resolve(outDir, filename);
		console.log('Writing ' + outfile);

		if (options.showOutput) {
			console.log(out, '');
		}

		if (!options.dryRun) {
			fs.writeFile(outfile, out, callback);
		} else {
			callback(null, out);
		}
	});
}

/**
 * Apply transforms to each files
 * @param files {Array}
 * @param options.outDir {String}
 */
function to6(files, options) {

	// require that files are provided
	if (files.length === 0) {
		return report(new Error('No files provided'));
	}

	async.each(files, function(filename, callback) {
		options.filename = filename;
		applyTransforms(options, callback);
	}, function(err) {
		report(err, files);
	});
}

module.exports = to6;
