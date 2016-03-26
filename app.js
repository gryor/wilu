'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var sources = function () {
	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(info) {
		var _this = this;

		var _loop, name, _ret;

		return regeneratorRuntime.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						_context2.prev = 0;
						_loop = regeneratorRuntime.mark(function _callee(name) {
							var target, src, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, exclude, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _loop2, _iterator2, _step2, type;

							return regeneratorRuntime.wrap(function _callee$(_context) {
								while (1) {
									switch (_context.prev = _context.next) {
										case 0:
											target = info.build[name];

											target.sources = target.sources || {};
											src = target.sources;

											src.extensions = src.extensions || { c: new Set(['c']), 'c++': new Set(['cc', 'cpp']), asm: new Set(['s', 'S']) };

											if (src.path === undefined) src.path = 'src';

											if (src.subpath) {
												src.path = _path2.default.join(src.path, src.subpath);
												delete src.subpath;
											}

											if (src.include === undefined) src.include = new Set(['**/*.c']);

											if (!(isSet(src.include) && src.path !== null)) {
												_context.next = 60;
												break;
											}

											if (!isSet(src.exclude)) {
												_context.next = 28;
												break;
											}

											_iteratorNormalCompletion = true;
											_didIteratorError = false;
											_iteratorError = undefined;
											_context.prev = 12;

											for (_iterator = src.exclude[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
												exclude = _step.value;

												src.include.delete(exclude);
											}
											_context.next = 20;
											break;

										case 16:
											_context.prev = 16;
											_context.t0 = _context['catch'](12);
											_didIteratorError = true;
											_iteratorError = _context.t0;

										case 20:
											_context.prev = 20;
											_context.prev = 21;

											if (!_iteratorNormalCompletion && _iterator.return) {
												_iterator.return();
											}

										case 23:
											_context.prev = 23;

											if (!_didIteratorError) {
												_context.next = 26;
												break;
											}

											throw _iteratorError;

										case 26:
											return _context.finish(23);

										case 27:
											return _context.finish(20);

										case 28:
											_context.next = 30;
											return Promise.all([].concat(_toConsumableArray(src.include)).map(function (pattern) {
												return aglob(pattern, { cwd: src.path });
											}));

										case 30:
											src.include = _context.sent;

											src.include = src.include.reduce(function (all, current) {
												return [].concat(_toConsumableArray(all), _toConsumableArray(current));
											});

											if (!isSet(src.exclude)) {
												_context.next = 53;
												break;
											}

											_iteratorNormalCompletion2 = true;
											_didIteratorError2 = false;
											_iteratorError2 = undefined;
											_context.prev = 36;

											_loop2 = function _loop2() {
												var exclude = _step2.value;

												src.include = src.include.filter(function (include) {
													return !(0, _minimatch2.default)(include, exclude);
												});
											};

											for (_iterator2 = src.exclude[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
												_loop2();
											}_context.next = 45;
											break;

										case 41:
											_context.prev = 41;
											_context.t1 = _context['catch'](36);
											_didIteratorError2 = true;
											_iteratorError2 = _context.t1;

										case 45:
											_context.prev = 45;
											_context.prev = 46;

											if (!_iteratorNormalCompletion2 && _iterator2.return) {
												_iterator2.return();
											}

										case 48:
											_context.prev = 48;

											if (!_didIteratorError2) {
												_context.next = 51;
												break;
											}

											throw _iteratorError2;

										case 51:
											return _context.finish(48);

										case 52:
											return _context.finish(45);

										case 53:

											src.include = src.include.map(function (include) {
												return _path2.default.join(src.path, include);
											});
											src.include = [].concat(_toConsumableArray(new Set(src.include)));
											src.path = null;

											if (!(src.include.size === 0)) {
												_context.next = 58;
												break;
											}

											return _context.abrupt('return', 'continue');

										case 58:

											for (type in src.extensions) {
												src.extensions[type] = new Set([].concat(_toConsumableArray(src.extensions[type])).map(function (ext) {
													return _minimatch2.default.match(src.include, '*.' + ext, { matchBase: true });
												}).reduce(function (a, b) {
													return [].concat(_toConsumableArray(a), _toConsumableArray(b));
												}));

												if (src.extensions[type].size === 0) delete src.extensions[type];
											}

											target.sources = src.extensions;

										case 60:
										case 'end':
											return _context.stop();
									}
								}
							}, _callee, _this, [[12, 16, 20, 28], [21,, 23, 27], [36, 41, 45, 53], [46,, 48, 52]]);
						});
						_context2.t0 = regeneratorRuntime.keys(info.build);

					case 3:
						if ((_context2.t1 = _context2.t0()).done) {
							_context2.next = 11;
							break;
						}

						name = _context2.t1.value;
						return _context2.delegateYield(_loop(name), 't2', 6);

					case 6:
						_ret = _context2.t2;

						if (!(_ret === 'continue')) {
							_context2.next = 9;
							break;
						}

						return _context2.abrupt('continue', 3);

					case 9:
						_context2.next = 3;
						break;

					case 11:
						_context2.next = 16;
						break;

					case 13:
						_context2.prev = 13;
						_context2.t3 = _context2['catch'](0);
						throw _context2.t3;

					case 16:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, this, [[0, 13]]);
	}));

	return function sources(_x3) {
		return ref.apply(this, arguments);
	};
}();

var makefile = function () {
	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(info) {
		var out, outdirs, name, _target, compilers, linker, _src, targetObjects, type, objects, compiler, flags, compile, builtObjects, dirs, mkdirs, link;

		return regeneratorRuntime.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						_context3.prev = 0;

						if (info.build) {
							_context3.next = 3;
							break;
						}

						throw new Error('package.json:build is not defined');

					case 3:

						targets(info);
						_context3.next = 6;
						return sources(info);

					case 6:
						out = [];
						outdirs = new Set();
						_context3.t0 = regeneratorRuntime.keys(info.build);

					case 9:
						if ((_context3.t1 = _context3.t0()).done) {
							_context3.next = 30;
							break;
						}

						name = _context3.t1.value;
						_target = info.build[name];


						initTarget(info, _target);

						compilers = _target.compilers;
						linker = _target.toolset + (_target.sources['c++'] ? _target.compilers['c++'] : _target.compilers['c']);
						_src = _target.sources;
						targetObjects = [];


						for (type in _src) {
							objects = suffix(_src[type], '.o');

							targetObjects = targetObjects.concat(objects);
							compiler = _target.toolset + _target.compilers[type];
							flags = _target.compiler.flags.always;


							if (_target.compiler.flags[type]) flags += ' ' + _target.compiler.flags[type];

							compile = [objects.join(' ') + ': %.o: %\n\t@' + compiler, flags, _target.machine, _target.definitions, _target.search.includes, _target.assembler.flags, '-c $< -o', _path2.default.join(_target.objdirectory, name, '$@')];


							compile = compile.filter(function (e) {
								return !(!e || e.length === 0);
							}).join(' ');
							out.push(compile);
						}

						if (!(targetObjects.length === 0)) {
							_context3.next = 20;
							break;
						}

						return _context3.abrupt('continue', 9);

					case 20:

						targetObjects = [].concat(_toConsumableArray(new Set(targetObjects)));

						outdirs.add(_target.directory);

						builtObjects = prefix(targetObjects, _path2.default.join(_target.objdirectory, name) + _path2.default.sep);
						dirs = [_target.subdirectory].concat(_toConsumableArray(new Set(builtObjects.map(function (o) {
							return _path2.default.dirname(o);
						})))).join(' ');
						mkdirs = [dirs + ':\n\t@mkdir -p ' + dirs];

						// linker erikseen, kerää tiedot kaikista kielistä!

						link = [name + ':', dirs, targetObjects.join(' ') + '\n\t@' + linker, _target.linker.flags, _target.linker.scripts, _target.machine, _target.definitions, _target.libraries, _target.search.libraries, _target.search.scripts, builtObjects.join(' '), '-o', _path2.default.join(_target.subdirectory, _target.name)];


						link = link.filter(function (e) {
							return !(!e || e.length === 0);
						}).join(' ');
						out.push(mkdirs, link);
						_context3.next = 9;
						break;

					case 30:

						if (outdirs.size) out.push('clean:\n\t-@rm -rf ' + [].concat(_toConsumableArray(outdirs)).join(' '));

						out = out.filter(function (e) {
							return !(!e || e.length === 0);
						});
						out = out.join('\n\n');

						if (out.length) out += '\n';

						return _context3.abrupt('return', out);

					case 37:
						_context3.prev = 37;
						_context3.t2 = _context3['catch'](0);
						throw _context3.t2;

					case 40:
					case 'end':
						return _context3.stop();
				}
			}
		}, _callee3, this, [[0, 37]]);
	}));

	return function makefile(_x4) {
		return ref.apply(this, arguments);
	};
}();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var log = (0, _debug2.default)('wilu');

function isObject(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Object.prototype);
}

function isSet(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Set.prototype);
}

function parseObject(obj) {
	var iterating = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

	try {
		for (var property in obj) {
			if (Array.isArray(obj[property])) {
				obj[property] = new Set(obj[property]);
			} else if (obj[property] === null) {
				delete obj[property];
			} else if (property === '+' && !iterating) {
				continue;
			} else if (isObject(obj[property])) {
				obj[property] = parseObject(obj[property], true);
			}
		}
	} catch (e) {
		throw e;
	}
}

function reduceObjects(parent, child) {
	var iterating = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

	try {
		for (var property in parent) {
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

		for (var _property in child) {
			if (Array.isArray(child[_property])) child[_property] = new Set(child[_property]);
		}
	} catch (e) {
		throw e;
	}
}

function reduce(parent) {
	try {
		parseObject(parent);
		var childs = parent['+'];

		for (var name in childs) {
			var child = childs[name];

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

		for (var name in childs) {
			var grandchilds = childs[name]['+'];

			if (!isObject(grandchilds)) continue;

			for (var gname in grandchilds) {
				if (parent['+'][gname] === undefined) parent['+'][gname] = grandchilds[gname];
			}

			combine(parent, grandchilds);
			delete childs[name]['+'];
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
			(0, _glob2.default)(pattern, options, function (error, results) {
				if (error) fail(error);else success(results);
			});
		});
	} catch (e) {
		throw e;
	}
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

function initTarget(info, target) {
	try {
		target.name = target.name || info.name || 'app';
		target.version = target.version || info.version || '0.0.1';
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
		target.objdirectory = _path2.default.join(target.directory, target.objdirectory);
		target.subdirectory = _path2.default.join(target.directory, target.subdirectory);

		if (target.toolset && target.toolset.length) target.toolset += '-';else target.toolset = '';

		if (target.compilers.c === undefined) target.compilers.c = 'gcc';

		if (target.compilers['c++'] === undefined) target.compilers['c++'] = 'g++';

		if (target.compilers.asm === undefined) target.compilers.asm = 'gcc -x --assembler-with-cpp';

		if (isSet(target.machine)) target.machine = prefix(target.machine, '-m').join(' ');
		if (isSet(target.definitions)) target.definitions = prefix(target.definitions, '-D').join(' ');
		if (isSet(target.linker.flags)) target.linker.flags = prefix(target.linker.flags, '-Wl,-').join(' ');
		if (isSet(target.linker.scripts)) target.linker.scripts = prefix(target.linker.scripts, '-T').join(' ');
		if (isSet(target.assembler.flags)) target.assembler.flags = prefix(target.assembler.flags, '-Wa,-').join(' ');
		if (isSet(target.libraries)) target.libraries = prefix(target.libraries, '-l').join(' ');
		if (isSet(target.search.includes)) target.search.includes = prefix(target.search.includes, '-I').join(' ');
		if (isSet(target.search.libraries)) target.search.libraries = prefix(target.search.libraries, '-L').join(' ');
		if (isSet(target.search.scripts)) target.search.scripts = prefix(target.search.scripts, '-Wl,-L').join(' ');

		for (var type in target.compiler.flags) {
			if (isSet(target.compiler.flags[type])) target.compiler.flags[type] = prefix(target.compiler.flags[type], '-').join(' ');
		}
	} catch (e) {
		throw e;
	}
}

exports.default = makefile;


if (require.main === module) {
	_asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
		return regeneratorRuntime.wrap(function _callee4$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						_context4.prev = 0;
						_context4.next = 3;
						return makefile(require('./package.json'));

					case 3:
						_context4.t0 = _context4.sent;
						_context4.t1 = '\n' + _context4.t0;
						log('makefile', _context4.t1);
						_context4.next = 12;
						break;

					case 8:
						_context4.prev = 8;
						_context4.t2 = _context4['catch'](0);

						log(_context4.t2);
						throw _context4.t2;

					case 12:
					case 'end':
						return _context4.stop();
				}
			}
		}, _callee4, this, [[0, 8]]);
	}))();
}
