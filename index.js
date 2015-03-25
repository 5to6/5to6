var program = require('commander');
var pkg = require('./package.json');
var async = require('async');
var fs = require('fs');
var path = require('path');
var espree = require('espree');
var escodegen = require('escodegen');
var startTime = Date.now();

program
	.version(pkg.version)
	.option('-x, --ext', 'Add peppers')
	.option('-P, --pineapple', 'Add pineapple')
	.option('-b, --bbq', 'Add bbq sauce')
	.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
	// .command(' <dir1> <dir2>')
	// .description('execute the given remote cmd')
	.parse(process.argv);

var transforms = require('requireindex')('./transforms');
var files = program.args; // TODO: glob

async.each(files, applyTransforms, report);

function report(err) {
	if (err) {
		console.error(err);
		return;
	}
	console.log("Applied " + files.length + " transforms in " + (Date.now() - startTime) + " ms.");
}

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

		// what should we actually do with the data?
		console.log(out);

		callback();
	});
}