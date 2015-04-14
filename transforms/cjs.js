/**
 * Transform CommonJS to ES6.
 *
 * This transform translates CJS modules into ES6 modules.
 *
 * @param {String} file
 * @return {Stream}
 * @api public
 */

'use strict';

var estraverse = require('estraverse');
// var util = require('util');

/**
 * Map a require to an import statement.
 * @param node
 * @returns {*}
 */
function requireToImport(node) {
	if (node.type !== 'VariableDeclarator') {
		return node;
	}
	return {
		type: 'ImportDeclaration',
		specifiers: [{
			type: 'ImportDefaultSpecifier',
			local: node.id
		}],
		source: node.init.arguments[0]
	};
}

module.exports = function (ast) {

	var importStatements = [];

	return estraverse.replace(ast, {

		// skip all things nested in functions
		enter: function (node) {
			var localRequires;

			if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
				return this.skip();
			}

//			{ type: 'Program',
//				body:
//				[ { type: 'ImportDeclaration',
//					specifiers:
//						[ { type: 'ImportDefaultSpecifier',
//							local: { type: 'Identifier', name: 'a' } } ],
//					source: { type: 'Literal', value: 'b', raw: '"b"' } } ],
//					sourceType: 'module' }

			// var x = require('a'), y = require('b');
			if (node.type === 'VariableDeclaration') {
				localRequires = node.declarations.filter(function(decl) {
					return decl.init.type === 'CallExpression' && decl.init.callee.name === 'require';
				}).map(requireToImport);

				if (localRequires.length === 0) {
					return this.skip();
				}

				// global requires
				importStatements = importStatements.concat(localRequires);

				// in the lucky case that all the var block is just require() statements
				if (localRequires.length === node.declarations.length) {
					this.remove(); // easy peasy
				} else {
					console.log('need to untangle the var mess from the world...');
				}
			}
		},
		leave: function(node, parent) {

			// add back in all the import statements
			if (node.type === 'Program') {
				node.sourceType = 'module';
				node.body.unshift.apply(node.body, importStatements);
			}

//			{ type: 'Program',
//				body:
//				[ { type: 'ImportDeclaration',
//					specifiers: [],
//					source: { type: 'Literal', value: 'a', raw: '"a"' } } ],
//					sourceType: 'module' }

			// require('y');
			if (node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression' && node.expression.callee.name === 'require') {
				node.type = 'ImportDeclaration';
				node.specifiers = [];
				node.source = node.expression.arguments[0];
				delete node.expression;
				this.skip();
				return;
			}

//			{ type: 'Program',
//				body:
//				[ { type: 'ExportDefaultDeclaration',
//					declaration:
//					{ type: 'MemberExpression',
//						computed: false,
//						object: { type: 'Identifier', name: 'a' },
//						property: { type: 'Identifier', name: 'cow' } } } ],
//					sourceType: 'module' }

			// module.exports = b;
			if (node.type === 'AssignmentExpression' && node.operator === '=' &&
				node.left.type === 'MemberExpression' && node.left.object.name === 'module' &&
				node.left.property.name === 'exports') {
					parent.type = 'ExportDefaultDeclaration';
					parent.declaration = node.right;
					delete parent.expression;
			}
		}
	});

};
