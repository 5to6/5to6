/**
 * Module dependencies.
 */

'use strict';

var recast = require('recast');
var types = recast.types;
var n = types.namedTypes;
var b = types.builders;

function doTransform(ast) {
	var isAMD = false;
	recast.visit(ast, {
		visitExpressionStatement: function (path) {
			var node = path.node;
			var defineStmt = node.expression;
			var body = path.parentPath.node.body;
			var mainBody = [];

			// if i'm about to be a top-level define statement
			if (isDefine(node.expression) && path.parentPath.name === 'body') {
				isAMD = true;
				if (defineStmt.arguments.length === 2 && defineStmt.arguments[0].type === 'ArrayExpression') {
					var requires = createRequiresFromDefine(defineStmt);

					if (!requires || !requires.length) {
						console.log(defineStmt);
						path.replace();
						return false;
					}

					// add any comments above our define() above the first require()
					requires[0].comments = node.comments;

					// add those requires to the main body
					mainBody.push.apply(mainBody, requires);

					// if (defineStmt.arguments[1].body.type === 'BlockStatement') {
					mainBody.push.apply(mainBody, defineStmt.arguments[1].body.body);
					// }

					// add each item to the actual body
					body.push.apply(body, mainBody);

					path.replace();
					this.traverse(path.parentPath);
					// return false;
				}
			}

			this.traverse(path);

		},
		visitReturnStatement: function(path) {
			if (path.parentPath.name === 'body' && isAMD) {
				return createModuleExport(path.node.argument);
			}
			this.traverse(path);
		}
	});

	return ast;
}

function isDefine(node) {
	var callee = node.callee;
	var x = callee
		&& node.type === 'CallExpression'
		&& callee.type === 'Identifier'
		&& callee.name === 'define';
	return x;
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

function createRequiresFromDefine(node) {
	var array = node.arguments[0].elements;
	var args = node.arguments[1].params;
	if (!array || !args) {
		return null;
	}
	var ids = array.map(function(el) {
		return el.value;
	});
	var vars = args.map(function(arg) {
		return arg && arg.name;
	});
	return createRequires(ids, vars);
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

///**
// * Transform AMD to CommonJS.
// *
// * This transform translates AMD modules into CommonJS modules.  AMD modules
// * are defined by calling the `define` function that is available as a free
// * or global variable.
// *
// * @param {String} file
// * @return {Stream}
// * @api public
// */
// function doTransform(ast) {
//
//	var transformedAST = ast;
//	var isAMD = false;
//	var out = '';
//	pageLevelComments = [];
//
//	estraverse.replace(ast, {
//		enter: function(node) {
//			if (isDefine(node)) {
//				var parents = this.parents();
//
//				// Check that this module is an AMD module, as evidenced by invoking
//				// `define` at the top-level.  Any CommonJS or UMD modules are pass
//				// through unmodified.
//				if (parents.length === 2 && parents[0].type === 'Program' && parents[1].type === 'ExpressionStatement') {
//					pageLevelComments = parents[1].leadingComments;
//					isAMD = true;
//				}
//			}
//		},
//		leave: function(node) {
//			var factory, dependencies, ids, vars, reqs, obj, parents;
//			if (isDefine(node)) {
//				if (node.arguments.length === 1 && node.arguments[0].type === 'FunctionExpression') {
//					factory = node.arguments[0];
//
//					if (factory.params.length === 0) {
//						transformedAST = createProgram(factory.body.body);
//						this.break();
//					} else if (factory.params.length > 0) {
//						// simplified CommonJS wrapper
//						transformedAST = createProgram(factory.body.body);
//						this.break();
//					}
//				} else if (node.arguments.length === 1 && node.arguments[0].type === 'ObjectExpression') {
//					// object literal
//					obj = node.arguments[0];
//
//					transformedAST = createModuleExport(obj);
//					this.break();
//				} else if (node.arguments.length === 2 && node.arguments[0].type === 'ArrayExpression' && node.arguments[1].type === 'FunctionExpression') {
//					dependencies = node.arguments[0];
//					factory = node.arguments[1];
//
//					ids = dependencies.elements.map(function(el) { return el.value; });
//					vars = factory.params.map(function(el) { return el.name; });
//					reqs = createRequires(ids, vars);
//					if (reqs) {
//						transformedAST = createProgram(reqs.concat(factory.body.body));
//					} else {
//						transformedAST = createProgram(factory.body.body);
//					}
//					this.break();
//				} else if (node.arguments.length === 3 && node.arguments[0].type === 'Literal' && node.arguments[1].type === 'ArrayExpression' && node.arguments[2].type === 'FunctionExpression') {
//					dependencies = node.arguments[1];
//					factory = node.arguments[2];
//
//					ids = dependencies.elements.map(function(el) { return el.value; });
//					vars = factory.params.map(function(el) { return el.name; });
//					reqs = createRequires(ids, vars);
//					if (reqs) {
//						transformedAST = createProgram(reqs.concat(factory.body.body));
//					} else {
//						transformedAST = createProgram(factory.body.body);
//					}
//					this.break();
//				}
//			} else if (isReturn(node)) {
//				parents = this.parents();
//
//				if (parents.length === 5 && isDefine(parents[2]) && isAMD) {
//					return createModuleExport(node.argument);
//				}
//			}
//		}
//	});
//
//	if (!isAMD) {
//		return ast;
//	}
//
//	out = transformedAST || ast;
//
//	//console.log('-- TRANSFORMED AST --');
//	//console.log(util.inspect(transformedAST, false, null));
//	//console.log('---------------------');
//
//	return out;
//}

module.exports = doTransform;
