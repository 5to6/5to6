/**
 * This transform removes "use strict" statements.
 *
 * @param {String} file
 * @return {Stream}
 * @api public
 */

'use strict'; // the irony

var estraverse = require('estraverse');

module.exports = function (ast) {

	return estraverse.replace(ast, {
		enter: function(node) {
			if (node.type === 'ExpressionStatement' && node.expression.type === 'Literal' && node.expression.value === 'use strict') {
				this.remove();
			}
		}
	});

};
