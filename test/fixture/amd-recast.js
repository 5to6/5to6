/**
 * Happy as can be!
 */

var x = go(); // go go go!

/**
 * This is where I define things....
 */
define([
	'a',
	'b',
	'c',
	'd'
], function(a, b, c, d) {
	console.log(b); // this is a good comment

	// this is a bad one
	console.log(d);

	return b.dog;
});