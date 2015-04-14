/**
 * This transform moves to object shorthand for method
 * & properties.
 *
 * @param {String} file
 * @return {Stream}
 * @api public
 */

var estraverse = require('estraverse');

module.exports = function (ast) {

	return estraverse.replace(ast, {
		enter: function(node) {
			if (node.type === 'Property') {
				if (node.value.type === 'FunctionExpression') {
					node.method = true;
				}
				if (node.value.type === 'Identifier' && node.value.name === node.key.name) {
					node.shorthand = true;
					console.log("JACKPOT!");
				}
			}
		}
	});

};