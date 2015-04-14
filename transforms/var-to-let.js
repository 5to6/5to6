/**
 * This transforms "var" into "let"
 *
 * @param {String} file
 * @return {Stream}
 * @api public
 */

'use strict'; // the irony

var estraverse = require('estraverse');

module.exports = function (ast) {

	return estraverse.replace(ast, {
		enter: function() {
			// TODO: determine if we're entering a block and just give up
		},
		leave: function(node) {
			if (node.type === 'VariableDeclaration') {
				node.kind = 'let';
			}
		}
	});

};
