#!/usr/bin/env node

var program = require('commander');
var pkg = require('../package.json');
var to6 = require('../');

program
	.version(pkg.version)
	.option('-x, --ext', 'Add peppers')
	.option('-P, --pineapple', 'Add pineapple')
	.option('-b, --bbq', 'Add bbq sauce')
	.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
	// .command(' <dir1> <dir2>')
	// .description('execute the given remote cmd')
	.parse(process.argv);

var files = program.args; // TODO: glob
to6(files);