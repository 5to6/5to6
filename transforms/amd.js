/**
 * Module dependencies.
 */

'use strict';

var estraverse = require('estraverse');
// var util = require('util');

var pageLevelComments;



function isDefine(node) {
	var callee = node.callee;
	return callee
		&& node.type === 'CallExpression'
		&& callee.type === 'Identifier'
		&& callee.name === 'define'
		;
}

function isReturn(node) {
	return node.type === 'ReturnStatement';
}

function createProgram(body) {
	if (pageLevelComments) {
		body[0].leadingComments = pageLevelComments;
	}
	return {
		type: 'Program',
		body: body
	};
}

function createRequires(ids, vars) {
	var decls = [], expns = [], ast = [];

	for (var i = 0, len = ids.length; i < len; ++i) {
		if (['require', 'module', 'exports'].indexOf(ids[i]) !== -1) { continue; }
		if (typeof vars[i] === 'undefined') {
			expns.push({ type: 'ExpressionStatement',
				expression:
				{ type: 'CallExpression',
					callee: { type: 'Identifier', name: 'require'},
					arguments: [ { type: 'Literal', value: ids[i] } ] } });
		} else {
			decls.push({ type: 'VariableDeclarator',
				id: { type: 'Identifier', name: vars[i] },
				init:
				{ type: 'CallExpression',
					callee: { type: 'Identifier', name: 'require' },
					arguments: [ { type: 'Literal', value: ids[i] } ] } });
		}
	}

	if (decls.length === 0 && expns.length === 0) { return null; }

	if (decls.length > 0) {
		ast.push({ type: 'VariableDeclaration',
			declarations: decls,
			kind: 'var' });
	}

	if (expns.length > 0) {
		ast = ast.concat(expns);
	}

	return ast;
}

function createModuleExport(obj) {
	return { type: 'ExpressionStatement',
		expression:
		{ type: 'AssignmentExpression',
			operator: '=',
			left:
			{ type: 'MemberExpression',
				computed: false,
				object: { type: 'Identifier', name: 'module' },
				property: { type: 'Identifier', name: 'exports' } },
			right: obj } };
}

/**
 * Transform AMD to CommonJS.
 *
 * This transform translates AMD modules into CommonJS modules.  AMD modules
 * are defined by calling the `define` function that is available as a free
 * or global variable.
 *
 * @param {String} file
 * @return {Stream}
 * @api public
 */
 function doTransform(ast) {

	var transformedAST = ast;
	var isAMD = false;
	var out = '';
	pageLevelComments = [];

	estraverse.replace(ast, {
		enter: function(node) {
			if (isDefine(node)) {
				var parents = this.parents();

				// Check that this module is an AMD module, as evidenced by invoking
				// `define` at the top-level.  Any CommonJS or UMD modules are pass
				// through unmodified.
				if (parents.length === 2 && parents[0].type === 'Program' && parents[1].type === 'ExpressionStatement') {
					pageLevelComments = parents[1].leadingComments;
					isAMD = true;
				}
			}
		},
		leave: function(node) {
			var factory, dependencies, ids, vars, reqs, obj, parents;
			if (isDefine(node)) {
				if (node.arguments.length === 1 && node.arguments[0].type === 'FunctionExpression') {
					factory = node.arguments[0];

					if (factory.params.length === 0) {
						transformedAST = createProgram(factory.body.body);
						this.break();
					} else if (factory.params.length > 0) {
						// simplified CommonJS wrapper
						transformedAST = createProgram(factory.body.body);
						this.break();
					}
				} else if (node.arguments.length === 1 && node.arguments[0].type === 'ObjectExpression') {
					// object literal
					obj = node.arguments[0];

					transformedAST = createModuleExport(obj);
					this.break();
				} else if (node.arguments.length === 2 && node.arguments[0].type === 'ArrayExpression' && node.arguments[1].type === 'FunctionExpression') {
					dependencies = node.arguments[0];
					factory = node.arguments[1];

					ids = dependencies.elements.map(function(el) { return el.value; });
					vars = factory.params.map(function(el) { return el.name; });
					reqs = createRequires(ids, vars);
					if (reqs) {
						transformedAST = createProgram(reqs.concat(factory.body.body));
					} else {
						transformedAST = createProgram(factory.body.body);
					}
					this.break();
				} else if (node.arguments.length === 3 && node.arguments[0].type === 'Literal' && node.arguments[1].type === 'ArrayExpression' && node.arguments[2].type === 'FunctionExpression') {
					dependencies = node.arguments[1];
					factory = node.arguments[2];

					ids = dependencies.elements.map(function(el) { return el.value; });
					vars = factory.params.map(function(el) { return el.name; });
					reqs = createRequires(ids, vars);
					if (reqs) {
						transformedAST = createProgram(reqs.concat(factory.body.body));
					} else {
						transformedAST = createProgram(factory.body.body);
					}
					this.break();
				}
			} else if (isReturn(node)) {
				parents = this.parents();

				if (parents.length === 5 && isDefine(parents[2]) && isAMD) {
					return createModuleExport(node.argument);
				}
			}
		}
	});

	if (!isAMD) {
		return ast;
	}

	out = transformedAST || ast;

	//console.log('-- TRANSFORMED AST --');
	//console.log(util.inspect(transformedAST, false, null));
	//console.log('---------------------');

	return out;
}

module.exports = doTransform;
