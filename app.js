'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _packageJson = require('./package.json');

var pkg = _interopRequireWildcard(_packageJson);

var log = (0, _debug2['default'])('wilu');

function isObject(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Object.prototype);
}

function isSet(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Set.prototype);
}

function reduceObjects(parent, child) {
	var iterating = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

	try {
		for (var property in parent) {
			if (Array.isArray(parent[property])) parent[property] = new Set(parent[property]);

			if (property === '+' && !iterating) {
				continue;
			} else if (child[property] === undefined) {
				child[property] = parent[property];
			} else if (child[property] === null) {
				delete child[property];
			} else if (isSet(parent[property]) && Array.isArray(child[property])) {
				child[property] = new Set([].concat(_toConsumableArray(parent[property]), _toConsumableArray(child[property])));
			} else if (isObject(parent[property]) && isObject(child[property])) {
				reduceObjects(parent[property], child[property], true);
			}
		}

		for (var property in child) {
			if (Array.isArray(child[property])) child[property] = new Set(child[property]);
		}
	} catch (e) {
		throw e;
	}
}

function reduce(parent) {
	try {
		var childs = parent['+'];

		for (var _name in childs) {
			var child = childs[_name];

			if (!isObject(child)) continue;

			reduceObjects(parent, child);
			reduce(child);
		}
	} catch (e) {
		throw e;
	}
}

function combine(parent, childs) {
	try {
		childs = childs || parent['+'];

		for (var _name2 in childs) {
			var grandchilds = childs[_name2]['+'];

			if (!isObject(grandchilds)) continue;

			for (var gname in grandchilds) {
				if (parent['+'][gname] === undefined) parent['+'][gname] = grandchilds[gname];
			}

			combine(parent, grandchilds);
			delete childs[_name2]['+'];
		}
	} catch (e) {
		throw e;
	}
}

function targets(info) {
	reduce(info.build);
	combine(info.build);
	if (info.build['+']) info.build = info.build['+'];
}

function aglob(pattern, options) {
	try {
		return new Promise(function (success, fail) {
			(0, _glob2['default'])(pattern, options, function (error, results) {
				if (error) fail(error);else success(results);
			});
		});
	} catch (e) {
		throw e;
	}
}

function sources(info) {
	var _loop, _name3, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2;

	return regeneratorRuntime.async(function sources$(context$1$0) {
		var _this = this;

		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:
				context$1$0.prev = 0;

				_loop = function callee$1$0(_name3) {
					var target, src, exclude, _loop2, type;

					return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
						while (1) switch (context$2$0.prev = context$2$0.next) {
							case 0:
								target = info.build[_name3];

								target.sources = target.sources || {};
								src = target.sources;

								src.extensions = src.extensions || { c: new Set(['c']), 'c++': new Set(['cc', 'cpp']), asm: new Set(['s', 'S']) };

								if (src.path === undefined) src.path = 'src';

								if (src.subpath) {
									src.path = _path2['default'].join(src.path, src.subpath);
									delete src.subpath;
								}

								if (!(isSet(src.include) && src.path !== null)) {
									context$2$0.next = 54;
									break;
								}

								_iteratorNormalCompletion = true;
								_didIteratorError = false;
								_iteratorError = undefined;
								context$2$0.prev = 10;

								for (_iterator = src.exclude[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
									exclude = _step.value;

									src.include['delete'](exclude);
								}

								context$2$0.next = 18;
								break;

							case 14:
								context$2$0.prev = 14;
								context$2$0.t0 = context$2$0['catch'](10);
								_didIteratorError = true;
								_iteratorError = context$2$0.t0;

							case 18:
								context$2$0.prev = 18;
								context$2$0.prev = 19;

								if (!_iteratorNormalCompletion && _iterator['return']) {
									_iterator['return']();
								}

							case 21:
								context$2$0.prev = 21;

								if (!_didIteratorError) {
									context$2$0.next = 24;
									break;
								}

								throw _iteratorError;

							case 24:
								return context$2$0.finish(21);

							case 25:
								return context$2$0.finish(18);

							case 26:
								context$2$0.next = 28;
								return regeneratorRuntime.awrap(Promise.all([].concat(_toConsumableArray(src.include)).map(function (pattern) {
									return aglob(pattern, { cwd: src.path, matchBase: true });
								})));

							case 28:
								src.include = context$2$0.sent;

								src.include = src.include.reduce(function (all, current) {
									return [].concat(_toConsumableArray(all), _toConsumableArray(current));
								});

								_iteratorNormalCompletion2 = true;
								_didIteratorError2 = false;
								_iteratorError2 = undefined;
								context$2$0.prev = 33;

								_loop2 = function () {
									var exclude = _step2.value;

									src.include = src.include.filter(function (include) {
										return !(0, _minimatch2['default'])(include, exclude, { matchBase: true });
									});
								};

								for (_iterator2 = src.exclude[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
									_loop2();
								}context$2$0.next = 42;
								break;

							case 38:
								context$2$0.prev = 38;
								context$2$0.t1 = context$2$0['catch'](33);
								_didIteratorError2 = true;
								_iteratorError2 = context$2$0.t1;

							case 42:
								context$2$0.prev = 42;
								context$2$0.prev = 43;

								if (!_iteratorNormalCompletion2 && _iterator2['return']) {
									_iterator2['return']();
								}

							case 45:
								context$2$0.prev = 45;

								if (!_didIteratorError2) {
									context$2$0.next = 48;
									break;
								}

								throw _iteratorError2;

							case 48:
								return context$2$0.finish(45);

							case 49:
								return context$2$0.finish(42);

							case 50:
								src.include = src.include.map(function (include) {
									return _path2['default'].join(src.path, include);
								});
								src.include = [].concat(_toConsumableArray(new Set(src.include)));
								src.path = null;

								for (type in src.extensions) {
									src.extensions[type] = new Set([].concat(_toConsumableArray(src.extensions[type])).map(function (ext) {
										return _minimatch2['default'].match(src.include, '*.' + ext, { matchBase: true });
									}).reduce(function (a, b) {
										return [].concat(_toConsumableArray(a), _toConsumableArray(b));
									}));

									if (src.extensions[type].size === 0) delete src.extensions[type];
								}

							case 54:

								target.sources = src.extensions;

							case 55:
							case 'end':
								return context$2$0.stop();
						}
					}, null, _this, [[10, 14, 18, 26], [19,, 21, 25], [33, 38, 42, 50], [43,, 45, 49]]);
				};

				context$1$0.t0 = regeneratorRuntime.keys(info.build);

			case 3:
				if ((context$1$0.t1 = context$1$0.t0()).done) {
					context$1$0.next = 9;
					break;
				}

				_name3 = context$1$0.t1.value;
				context$1$0.next = 7;
				return regeneratorRuntime.awrap(_loop(_name3));

			case 7:
				context$1$0.next = 3;
				break;

			case 9:
				context$1$0.next = 14;
				break;

			case 11:
				context$1$0.prev = 11;
				context$1$0.t2 = context$1$0['catch'](0);
				throw context$1$0.t2;

			case 14:
			case 'end':
				return context$1$0.stop();
		}
	}, null, this, [[0, 11]]);
}

function prefix(set, text) {
	return [].concat(_toConsumableArray(set)).map(function (item) {
		return text + item;
	});
}

function suffix(set, text) {
	return [].concat(_toConsumableArray(set)).map(function (item) {
		return item + text;
	});
}

function makefile(info) {
	var out, outdirs, _name4, target, compilers, src, type, objects, compiler, linker, flags, compile, builtObjects, dirs, mkdirs, link;

	return regeneratorRuntime.async(function makefile$(context$1$0) {
		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:
				context$1$0.prev = 0;

				if (pkg.build) {
					context$1$0.next = 3;
					break;
				}

				return context$1$0.abrupt('return');

			case 3:

				targets(pkg);
				context$1$0.next = 6;
				return regeneratorRuntime.awrap(sources(pkg));

			case 6:
				out = [];
				outdirs = new Set();

				for (_name4 in info.build) {
					target = info.build[_name4];

					target.name = target.name || 'app';
					target.directory = target.directory || 'build';
					target.objdirectory = target.objdirectory || 'obj';
					target.subdirectory = target.subdirectory || 'bin';
					target.compilers = target.compilers || {};
					target.compiler = target.compiler || {};
					target.compiler.flags = target.compiler.flags || {};
					target.compiler.flags.always = target.compiler.flags.always || new Set();
					target.machine = target.machine || new Set();
					target.definitions = target.definitions || new Set();
					target.linker = target.linker || {};
					target.linker.flags = target.linker.flags || new Set();
					target.linker.scripts = target.linker.scripts || new Set();
					target.assembler = target.assembler || {};
					target.assembler.flags = target.assembler.flags || new Set();
					target.libraries = target.libraries || new Set();
					target.search = target.search || {};
					target.search.includes = target.search.includes || new Set();
					target.search.libraries = target.search.libraries || new Set();
					target.search.scripts = target.search.scripts || new Set();

					compilers = target.compilers;
					src = target.sources;

					outdirs.add(target.directory);
					target.objdirectory = _path2['default'].join(target.directory, target.objdirectory);
					target.subdirectory = _path2['default'].join(target.directory, target.subdirectory);

					if (target.toolset && target.toolset.length) target.toolset += '-';

					if (compilers.c === undefined) compilers.c = 'gcc';

					if (compilers['c++'] === undefined) compilers['c++'] = 'g++';

					if (compilers.asm === undefined) compilers.asm = 'gcc -x --assembler-with-cpp';

					if (isSet(target.machine)) target.machine = prefix(target.machine, '-m').join(' ');
					if (isSet(target.definitions)) target.definitions = prefix(target.definitions, '-D').join(' ');
					if (isSet(target.linker.flags)) target.linker.flags = prefix(target.linker.flags, '-Wl,-').join(' ');
					if (isSet(target.linker.scripts)) target.linker.scripts = prefix(target.linker.scripts, '-T').join(' ');
					if (isSet(target.assembler.flags)) target.assembler.flags = prefix(target.assembler.flags, '-Wa,-').join(' ');
					if (isSet(target.libraries)) target.libraries = prefix(target.libraries, '-l').join(' ');
					if (isSet(target.search.includes)) target.search.includes = prefix(target.search.includes, '-I').join(' ');
					if (isSet(target.search.libraries)) target.search.libraries = prefix(target.search.libraries, '-L').join(' ');
					if (isSet(target.search.scripts)) target.search.scripts = prefix(target.search.scripts, '-Wl,-L').join(' ');

					for (type in target.compiler.flags) {
						if (isSet(target.compiler.flags[type])) target.compiler.flags[type] = prefix(target.compiler.flags[type], '-').join(' ');
					}

					for (type in src) {
						objects = suffix(src[type], '.o');
						compiler = target.toolset + target.compilers[type];
						linker = target.toolset + (target.sources['c++'] ? target.compilers['c++'] : target.compilers['c']);
						flags = target.compiler.flags.always;

						if (target.compiler.flags[type]) flags += ' ' + target.compiler.flags[type];

						compile = [objects.join(' ') + ': %.o: %\n\t@' + compiler, flags, target.machine, target.definitions, target.search.includes, target.assembler.flags, '-c $< -o', _path2['default'].join(target.objdirectory, _name4, '$@')];

						compile = compile.filter(function (e) {
							return !(!e || e.length === 0);
						}).join(' ');

						builtObjects = prefix(objects, _path2['default'].join(target.objdirectory, _name4) + _path2['default'].sep);
						dirs = [target.subdirectory].concat(_toConsumableArray(new Set(builtObjects.map(function (o) {
							return _path2['default'].dirname(o);
						})))).join(' ');
						mkdirs = [dirs + ':\n\t@mkdir -p ' + dirs];
						link = [_name4 + ':', dirs, objects.join(' ') + '\n\t@' + linker, target.linker.flags, target.linker.scripts, target.machine, target.definitions, target.libraries, target.search.libraries, target.search.scripts, builtObjects.join(' '), '-o', _path2['default'].join(target.subdirectory, target.name)];

						link = link.filter(function (e) {
							return !(!e || e.length === 0);
						}).join(' ');

						out.push(mkdirs, compile, link);
					}
				}

				out.push('clean:\n\t-@rm -rf ' + [].concat(_toConsumableArray(outdirs)).join(' '));

				return context$1$0.abrupt('return', out.join('\n\n') + '\n');

			case 13:
				context$1$0.prev = 13;
				context$1$0.t0 = context$1$0['catch'](0);
				throw context$1$0.t0;

			case 16:
			case 'end':
				return context$1$0.stop();
		}
	}, null, this, [[0, 13]]);
}

exports['default'] = makefile;

(function callee$0$0() {
	return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:
				context$1$0.prev = 0;
				context$1$0.next = 7;
				break;

			case 3:
				context$1$0.prev = 3;
				context$1$0.t0 = context$1$0['catch'](0);

				console.error(context$1$0.t0.stack);
				throw context$1$0.t0;

			case 7:
			case 'end':
				return context$1$0.stop();
		}
	}, null, this, [[0, 3]]);
})();
module.exports = exports['default'];

//log(await makefile(pkg));
