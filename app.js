'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Makefile = exports.Target = exports.Sources = exports.MakeVariables = exports.LinkRule = exports.CompileRule = exports.Tool = exports.Options = exports.Version = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var log = (0, _debug2.default)('wilu');

function isObject(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Object.prototype);
}

function isSet(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Set.prototype);
}

function isString(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(String.prototype);
}

function writeFile(path, content) {
	try {
		return new Promise(function (success, fail) {
			_fs2.default.writeFile(path, content, function (error) {
				return error ? fail(error) : success();
			});
		});
	} catch (e) {
		throw e;
	}
}

var _cache_aglob = new Map();

function aglob(pattern, options) {
	try {
		var _ret = function () {
			var cacheKey = JSON.stringify({ pattern: pattern, options: options });

			if (_cache_aglob.has(cacheKey)) return {
					v: Promise.resolve(_cache_aglob.get(cacheKey))
				};else return {
					v: new Promise(function (success, fail) {
						(0, _glob2.default)(pattern, options, function (error, results) {
							if (error) fail(error);else {
								_cache_aglob.set(cacheKey, results);
								success(results);
							}
						});
					})
				};
		}();

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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
			} else if (Array.isArray(parent[property]) && Array.isArray(child[property])) {
				child[property] = [].concat(_toConsumableArray(parent[property]), _toConsumableArray(child[property]));
			} else if (isObject(parent[property]) && isObject(child[property])) {
				reduceObjects(parent[property], child[property], true);
			}
		}
	} catch (e) {
		throw e;
	}
}

function reduce(parent) {
	try {
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

var Version = exports.Version = function () {
	function Version(version) {
		_classCallCheck(this, Version);

		this.major = 0;
		this.minor = 0;
		this.patch = 1;

		if (version) {
			;

			var _version$split = version.split('.');

			var _version$split2 = _slicedToArray(_version$split, 3);

			this.major = _version$split2[0];
			this.minor = _version$split2[1];
			this.patch = _version$split2[2];
		}
	}

	_createClass(Version, [{
		key: 'toString',
		value: function toString() {
			return this.major + '.' + this.minor + '.' + this.patch;
		}
	}]);

	return Version;
}();

var Options = exports.Options = function () {
	function Options() {
		var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var preline = _ref.preline;
		var prefix = _ref.prefix;
		var suffix = _ref.suffix;
		var join = _ref.join;

		_classCallCheck(this, Options);

		this.list = new Set();
		this.raw = new Set();
		this.preline = '';
		this.prefix = '';
		this.suffix = '';
		this.join = ' ';

		if (prefix) this.prefix = prefix;

		if (suffix) this.suffix = suffix;

		if (join) this.join = join;

		if (preline) this.preline = preline;

		if (preline && join === undefined) this.join = ',';
	}

	_createClass(Options, [{
		key: 'toString',
		value: function toString() {
			var _this = this;

			try {
				if (!this.raw.size && !this.list.size) return '';

				var line = [].concat(_toConsumableArray(this.raw));

				if (this.list.size) {
					line = [].concat(_toConsumableArray(line), [this.preline + [].concat(_toConsumableArray(this.list)).map(function (item) {
						return _this.prefix + item + _this.suffix;
					}).join(this.join)]);
				}

				return line.join(' ');
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: 'append',
		value: function append(values) {
			try {
				if (values) this.list = new Set([].concat(_toConsumableArray(this.list), _toConsumableArray(values)));
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: 'prepend',
		value: function prepend(values) {
			try {
				if (values) this.list = new Set([].concat(_toConsumableArray(values), _toConsumableArray(this.list)));
			} catch (e) {
				throw e;
			}
		}
	}]);

	return Options;
}();

var Tool = exports.Tool = function () {
	function Tool() {
		var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var name = _ref2.name;
		var toolset = _ref2.toolset;

		_classCallCheck(this, Tool);

		this.name = '';
		this.options = new Set();

		if (name) this.name = name;

		if (toolset) this.name = toolset + '-' + name;
	}

	_createClass(Tool, [{
		key: 'toString',
		value: function toString() {
			try {
				return [this.name].concat(_toConsumableArray([].concat(_toConsumableArray(this.options)).filter(function (item) {
					return !!item;
				}).map(function (opt) {
					return opt.toString();
				}))).filter(function (item) {
					return item && item.length > 0;
				}).join(' ');
			} catch (e) {
				throw e;
			}
		}
	}]);

	return Tool;
}();

var CompileRule = exports.CompileRule = function () {
	function CompileRule() {
		var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var extension = _ref3.extension;
		var directory = _ref3.directory;
		var src = _ref3.src;

		_classCallCheck(this, CompileRule);

		this.targets = new Set();
		this.commands = new Set();
		this.extension = null;
		this.directory = null;
		this.src = null;

		if (extension) this.extension = extension;

		if (directory) this.directory = directory;

		if (src) this.src = src;
	}

	_createClass(CompileRule, [{
		key: 'toString',
		value: function toString() {
			try {
				return [].concat(_toConsumableArray(this.targets)).join(' ') + ': ' + _path2.default.join(this.directory, '%' + (this.extension ? '.' + this.extension + ': %' : ': ' + _path2.default.join(this.src, '%'))) + [].concat(_toConsumableArray(this.commands)).map(function (cmd) {
					return '\n\t@' + cmd;
				}).join('');
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: 'append',
		value: function append(values) {
			try {
				if (values) this.targets = new Set([].concat(_toConsumableArray(this.targets), _toConsumableArray(values)));
			} catch (e) {
				throw e;
			}
		}
	}]);

	return CompileRule;
}();

var LinkRule = exports.LinkRule = function () {
	function LinkRule() {
		var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var name = _ref4.name;

		_classCallCheck(this, LinkRule);

		this.name = '';
		this.depends = new Set();
		this.commands = new Set();

		if (name) this.name = name;
	}

	_createClass(LinkRule, [{
		key: 'toString',
		value: function toString() {
			try {
				return this.name + ': ' + [].concat(_toConsumableArray(this.depends)).join(' ') + [].concat(_toConsumableArray(this.commands)).map(function (cmd) {
					return '\n\t@' + cmd;
				}).join('');
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: 'append',
		value: function append(values) {
			try {
				if (values) this.depends = new Set([].concat(_toConsumableArray(this.depends), _toConsumableArray(values)));
			} catch (e) {
				throw e;
			}
		}
	}]);

	return LinkRule;
}();

var MakeVariables = exports.MakeVariables = function () {
	function MakeVariables() {
		_classCallCheck(this, MakeVariables);

		this.list = new Map();
	}

	_createClass(MakeVariables, [{
		key: 'toString',
		value: function toString() {
			try {
				return [].concat(_toConsumableArray(this.list)).map(function (v) {
					return v[0] + '= ' + v[1];
				}).join('\n');
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: 'append',
		value: function append(values) {
			try {
				if (!values) return;

				for (var property in values) {
					this.list.set(property, values[property]);
				}
			} catch (e) {
				throw e;
			}
		}
	}]);

	return MakeVariables;
}();

var Sources = exports.Sources = function () {
	function Sources() {
		var _ref5 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var path = _ref5.path;

		_classCallCheck(this, Sources);

		this.includes = new Set();
		this.excludes = new Set();
		this.path = undefined;
		this._cache = null;

		if (path) this.path = path;
	}

	_createClass(Sources, [{
		key: 'include',
		value: function include(values) {
			try {
				if (values) this.includes = new Set([].concat(_toConsumableArray(this.includes), _toConsumableArray(values)));
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: 'exclude',
		value: function exclude(values) {
			try {
				if (values) this.excludes = new Set([].concat(_toConsumableArray(this.excludes), _toConsumableArray(values)));
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: 'files',
		value: function () {
			var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
				var _this2 = this;

				var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, exclude, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _loop, _iterator2, _step2;

				return regeneratorRuntime.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								_context.prev = 0;

								if (!this._cache) {
									_context.next = 3;
									break;
								}

								return _context.abrupt('return', this._cache);

							case 3:
								if (this.includes.size) {
									_context.next = 5;
									break;
								}

								return _context.abrupt('return', new Set());

							case 5:
								_iteratorNormalCompletion = true;
								_didIteratorError = false;
								_iteratorError = undefined;
								_context.prev = 8;


								for (_iterator = this.excludes[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
									exclude = _step.value;

									this.includes.delete(exclude);
								}

								_context.next = 16;
								break;

							case 12:
								_context.prev = 12;
								_context.t0 = _context['catch'](8);
								_didIteratorError = true;
								_iteratorError = _context.t0;

							case 16:
								_context.prev = 16;
								_context.prev = 17;

								if (!_iteratorNormalCompletion && _iterator.return) {
									_iterator.return();
								}

							case 19:
								_context.prev = 19;

								if (!_didIteratorError) {
									_context.next = 22;
									break;
								}

								throw _iteratorError;

							case 22:
								return _context.finish(19);

							case 23:
								return _context.finish(16);

							case 24:
								_context.next = 26;
								return Promise.all([].concat(_toConsumableArray(this.includes)).map(function (pattern) {
									return aglob(pattern, { cwd: _this2.path });
								}));

							case 26:
								this._cache = _context.sent;

								this._cache = this._cache.reduce(function (all, current) {
									return [].concat(_toConsumableArray(all), _toConsumableArray(current));
								});

								_iteratorNormalCompletion2 = true;
								_didIteratorError2 = false;
								_iteratorError2 = undefined;
								_context.prev = 31;

								_loop = function _loop() {
									var exclude = _step2.value;

									_this2._cache = _this2._cache.filter(function (file) {
										return !(0, _minimatch2.default)(file, exclude);
									});
								};

								for (_iterator2 = this.excludes[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
									_loop();
								}_context.next = 40;
								break;

							case 36:
								_context.prev = 36;
								_context.t1 = _context['catch'](31);
								_didIteratorError2 = true;
								_iteratorError2 = _context.t1;

							case 40:
								_context.prev = 40;
								_context.prev = 41;

								if (!_iteratorNormalCompletion2 && _iterator2.return) {
									_iterator2.return();
								}

							case 43:
								_context.prev = 43;

								if (!_didIteratorError2) {
									_context.next = 46;
									break;
								}

								throw _iteratorError2;

							case 46:
								return _context.finish(43);

							case 47:
								return _context.finish(40);

							case 48:
								this._cache = new Set(this._cache);

								return _context.abrupt('return', this._cache);

							case 52:
								_context.prev = 52;
								_context.t2 = _context['catch'](0);
								throw _context.t2;

							case 55:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this, [[0, 52], [8, 12, 16, 24], [17,, 19, 23], [31, 36, 40, 48], [41,, 43, 47]]);
			}));

			function files() {
				return ref.apply(this, arguments);
			}

			return files;
		}()
	}, {
		key: 'organize',
		value: function organize(rules) {
			var _this3 = this;

			try {
				var result = new Map();

				if (this._cache) {
					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;

					try {
						for (var _iterator3 = rules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var _step3$value = _slicedToArray(_step3.value, 2);

							var type = _step3$value[0];
							var exts = _step3$value[1];

							var matches = new Set([].concat(_toConsumableArray(exts)).map(function (ext) {
								return _minimatch2.default.match([].concat(_toConsumableArray(_this3._cache)), '*.' + ext, { matchBase: true });
							}).reduce(function (a, b) {
								return [].concat(_toConsumableArray(a), _toConsumableArray(b));
							}));

							if (matches.size) result.set(type, matches);
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}
				}

				return result;
			} catch (e) {
				throw e;
			}
		}
	}, {
		key: 'toString',
		value: function toString() {
			try {
				if (!this._cache) return '';

				return [].concat(_toConsumableArray(this._cache)).join(' ');
			} catch (e) {
				throw e;
			}
		}
	}]);

	return Sources;
}();

var Target = exports.Target = function () {
	function Target() {
		_classCallCheck(this, Target);

		this.target = '';
		this.name = '';
		this.libname = '';
		this.version = new Version('0.0.1');
		this.library = false;
		this.shared = false;
		this.directories = {
			base: 'build',
			output: 'bin',
			objects: 'obj'
		};
		this.options = {
			compiler: new Map(),
			assembler: new Options({ preline: '-Wa,', prefix: '-' }),
			linker: new Options({ preline: '-Wl,', prefix: '-' }),
			scripts: new Options({ prefix: '-T' }),
			machine: new Options({ prefix: '-m' }),
			definitions: new Options({ prefix: '-D' }),
			libraries: {
				static: new Options({ prefix: '-l:lib', suffix: '.a' }),
				shared: new Options({ prefix: '-l:lib', suffix: '.so' })
			},
			search: {
				includes: new Options({ prefix: '-I' }),
				libraries: new Options({ prefix: '-L' }),
				scripts: new Options({ preline: '-Wl,', prefix: '-L' })
			}
		};
		this.extensions = new Map();
		this.depends = new Set();
		this.sources = new Sources();
		this.tools = new Map();
		this.linker = null;
		this.rules = new Set();
		this.objects = new Set();
	}

	_createClass(Target, [{
		key: 'parse',
		value: function () {
			var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name, target) {
				var _this4 = this;

				var type, options, search, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, opt, _type, files, _type2, tool, linker, link, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _loop2, _iterator5, _step5, _ret5, output, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, cmd, clean;

				return regeneratorRuntime.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								_context2.prev = 0;

								log({ name: name, target: target });

								this.target = name;
								this.name = target.name || 'app';

								if (target.version) this.version = new Version(target.version);

								if (target.library) {
									this.library = true;
									this.shared = !!target.shared;

									this.options.compiler.set('all', new Options({ prefix: '-' }));
									this.options.compiler.get('all').append(['fPIC']);

									if (this.shared) {
										this.libname = 'lib' + this.name + '.so.' + this.version;
										this.options.linker.raw.add('-shared');
										this.options.linker.raw.add('-fPIC');
										this.options.linker.list.add('soname,lib' + this.name + '.so.' + this.version.major);
									} else {
										this.libname = 'lib' + this.name + '.a';
										this.options.linker = new Options();
										this.options.linker.raw.add('rcs');
										this.linker = new Tool({ name: 'ar', toolset: target.toolset });
									}
								}

								Object.assign(this.directories, target.directories);

								if (!target.options) {
									_context2.next = 37;
									break;
								}

								for (type in target.options.compiler) {
									options = this.options.compiler.get(type) || new Options({ prefix: '-' });

									options.append(target.options.compiler[type]);
									this.options.compiler.set(type, options);
								}

								this.options.assembler.append(target.options.assembler);
								this.options.linker.append(target.options.linker);
								this.options.scripts.append(target.scripts);
								this.options.machine.append(target.machine);
								this.options.definitions.append(target.definitions);

								if (target.libraries) {
									this.options.libraries.static.append(target.libraries.static);
									this.options.libraries.shared.append(target.libraries.shared);
								}

								if (target.search) {
									if (target.home) {
										for (search in target.search) {
											this.options.search[search].append(target.search[search].map(function (p) {
												return _path2.default.isAbsolute(p) ? p : _path2.default.join(target.home, p);
											}));
										}
									}

									this.options.search.includes.append(target.search.includes);
									this.options.search.libraries.append(target.search.libraries);
									this.options.search.scripts.append(target.search.scripts);
								}

								if (!target.options.raw) {
									_context2.next = 37;
									break;
								}

								if (!target.options.raw.linker) {
									_context2.next = 37;
									break;
								}

								_iteratorNormalCompletion4 = true;
								_didIteratorError4 = false;
								_iteratorError4 = undefined;
								_context2.prev = 21;

								for (_iterator4 = target.options.raw.linker[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
									opt = _step4.value;

									this.options.linker.raw.add(opt);
								}_context2.next = 29;
								break;

							case 25:
								_context2.prev = 25;
								_context2.t0 = _context2['catch'](21);
								_didIteratorError4 = true;
								_iteratorError4 = _context2.t0;

							case 29:
								_context2.prev = 29;
								_context2.prev = 30;

								if (!_iteratorNormalCompletion4 && _iterator4.return) {
									_iterator4.return();
								}

							case 32:
								_context2.prev = 32;

								if (!_didIteratorError4) {
									_context2.next = 35;
									break;
								}

								throw _iteratorError4;

							case 35:
								return _context2.finish(32);

							case 36:
								return _context2.finish(29);

							case 37:

								target.extensions = target.extensions || {};
								target.extensions.c = target.extensions.c || ['c'];
								target.extensions.asm = target.extensions.asm || ['s', 'S'];
								target.extensions['c++'] = target.extensions['c++'] || ['cc', 'cpp'];
								target.extensions.copy = target.extensions.copy || ['h', 'hpp'];

								for (_type in target.extensions) {
									this.extensions.set(_type, new Set(target.extensions[_type]));
								}

								if (target.depends) {
									this.depends = new Set(target.depends);

									if (target.home) {
										(function () {
											var imports = new Set(target.import || []);

											_this4.depends = new Set([].concat(_toConsumableArray(_this4.depends)).map(function (d) {
												var modname = d.split('_')[0];

												if (modname.length && imports.has(modname)) return d;

												return target.modname + '_' + d;
											}));
										})();
									}
								}

								if (target.sources) {
									this.sources.path = target.sources.path || 'src';

									if (target.home) this.sources.path = _path2.default.join(target.home, this.sources.path);

									if (target.sources.subpath) this.sources.path = _path2.default.join(this.sources.path, target.sources.subpath);

									this.sources.include(target.sources.include);
									this.sources.exclude(target.sources.exclude);
								}

								_context2.next = 47;
								return this.sources.files();

							case 47:
								files = this.sources.organize(this.extensions);


								target.tools = target.tools || {};

								if (!target.tools.c) target.tools.c = 'gcc';

								if (!target.tools.asm) target.tools.asm = 'gcc -x assembler-with-cpp';

								if (!target.tools['c++']) target.tools['c++'] = 'g++';

								for (_type2 in target.tools) {
									tool = new Tool({ name: target.tools[_type2], toolset: target.toolset });


									if (this.options.compiler.has('all')) ;
									tool.options.add(this.options.compiler.get('all'));

									if (this.options.compiler.has(_type2)) ;
									tool.options.add(this.options.compiler.get(_type2));

									tool.options.add(this.options.machine);
									tool.options.add(this.options.definitions);
									tool.options.add(this.options.assembler);
									tool.options.add(this.options.search.includes);

									this.tools.set(_type2, tool);
								}

								if (!this.linker) {
									linker = null;


									if (files.has('c++')) linker = this.tools.get('c++').name;else if (files.has('c')) linker = this.tools.get('c').name;else linker = 'gcc';

									this.linker = new Tool({ name: linker });
								}

								this.linker.options.add(this.options.linker);

								if (!(this.library && !this.shared)) {
									this.linker.options.add(this.options.machine);
									this.linker.options.add(this.options.definitions);
									this.linker.options.add(this.options.search.libraries);
									this.linker.options.add(this.options.search.scripts);
									this.linker.options.add(this.options.scripts);
									this.linker.options.add(this.options.libraries.shared);
								}

								link = new LinkRule({ name: this.target });


								if (this.depends.size) link.append(this.depends);

								_iteratorNormalCompletion5 = true;
								_didIteratorError5 = false;
								_iteratorError5 = undefined;
								_context2.prev = 61;

								_loop2 = function _loop2() {
									var _step5$value = _slicedToArray(_step5.value, 2);

									var type = _step5$value[0];
									var tool = _step5$value[1];

									if (!files.has(type)) return 'continue';

									var directory = _path2.default.join(_this4.directories.base, _this4.directories.objects, _this4.name, _this4.target);
									var objects = [].concat(_toConsumableArray(files.get(type))).map(function (file) {
										return _path2.default.join(directory, _this4.sources.path, file + '.o');
									});
									_this4.objects = new Set([].concat(_toConsumableArray(_this4.objects), _toConsumableArray(objects)));

									var rule = new CompileRule({ extension: 'o', directory: directory });
									rule.append(objects);
									rule.commands.add('mkdir -p ${dir $@}');
									rule.commands.add(tool + ' -c $< -o $@');
									_this4.rules.add(rule);
								};

								_iterator5 = this.tools[Symbol.iterator]();

							case 64:
								if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
									_context2.next = 71;
									break;
								}

								_ret5 = _loop2();

								if (!(_ret5 === 'continue')) {
									_context2.next = 68;
									break;
								}

								return _context2.abrupt('continue', 68);

							case 68:
								_iteratorNormalCompletion5 = true;
								_context2.next = 64;
								break;

							case 71:
								_context2.next = 77;
								break;

							case 73:
								_context2.prev = 73;
								_context2.t1 = _context2['catch'](61);
								_didIteratorError5 = true;
								_iteratorError5 = _context2.t1;

							case 77:
								_context2.prev = 77;
								_context2.prev = 78;

								if (!_iteratorNormalCompletion5 && _iterator5.return) {
									_iterator5.return();
								}

							case 80:
								_context2.prev = 80;

								if (!_didIteratorError5) {
									_context2.next = 83;
									break;
								}

								throw _iteratorError5;

							case 83:
								return _context2.finish(80);

							case 84:
								return _context2.finish(77);

							case 85:

								if (this.objects.size || this.options.libraries.static.list.size) {
									link.append(this.objects);

									link.commands.add(['mkdir -p', _path2.default.join(this.directories.base, this.directories.output)].join(' '));

									output = _path2.default.join(this.directories.base, this.directories.output, this.library ? this.libname : this.name);


									if (this.library && !this.shared) link.commands.add([this.linker, output].concat(_toConsumableArray(this.objects)).join(' '));else {
										link.commands.add([this.linker].concat(_toConsumableArray(this.objects), [this.options.libraries.static, '-o', output]).map(function (e) {
											return e.toString();
										}).filter(function (e) {
											return e && e.length > 0;
										}).join(' '));
									}

									if (this.library && this.shared) {
										link.commands.add(['ln -sf', this.libname, _path2.default.join(this.directories.base, this.directories.output, 'lib' + this.name + '.so')].join(' '));

										link.commands.add(['ln -sf', this.libname, _path2.default.join(this.directories.base, this.directories.output, 'lib' + this.name + '.so.' + this.version.major)].join(' '));

										link.commands.add(['ln -sf', this.libname, _path2.default.join(this.directories.base, this.directories.output, 'lib' + this.name + '.so.' + this.version.major + '.' + this.version.minor)].join(' '));
									}
								}

								if (files.has('copy')) {
									(function () {
										var directory = _path2.default.join(_this4.directories.base, _this4.directories.output);
										var rule = new CompileRule({ directory: directory, src: _this4.sources.path });
										var targets = [].concat(_toConsumableArray(files.get('copy'))).map(function (file) {
											return _path2.default.join(directory, file);
										});
										rule.append(targets);
										rule.commands.add('mkdir -p ${dir $@}');
										rule.commands.add(['cd', _this4.sources.path + '; cp --parents -t', _path2.default.relative(_path2.default.join(process.cwd(), _this4.sources.path), _path2.default.join(process.cwd(), directory)), '$*'].join(' '));

										_this4.rules.add(rule);
										link.append(targets);
									})();
								}

								if (!target.commands) {
									_context2.next = 107;
									break;
								}

								_iteratorNormalCompletion6 = true;
								_didIteratorError6 = false;
								_iteratorError6 = undefined;
								_context2.prev = 91;

								for (_iterator6 = target.commands[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
									cmd = _step6.value;

									link.commands.add(['cd', this.sources.path + '; ', cmd].join(' '));
								}_context2.next = 99;
								break;

							case 95:
								_context2.prev = 95;
								_context2.t2 = _context2['catch'](91);
								_didIteratorError6 = true;
								_iteratorError6 = _context2.t2;

							case 99:
								_context2.prev = 99;
								_context2.prev = 100;

								if (!_iteratorNormalCompletion6 && _iterator6.return) {
									_iterator6.return();
								}

							case 102:
								_context2.prev = 102;

								if (!_didIteratorError6) {
									_context2.next = 105;
									break;
								}

								throw _iteratorError6;

							case 105:
								return _context2.finish(102);

							case 106:
								return _context2.finish(99);

							case 107:

								this.rules.add(link);

								if (files.size || this.options.libraries.static.list.size) {
									clean = new LinkRule({ name: 'clean-' + this.target });

									clean.commands.add('rm -rf ' + this.directories.base);
									this.rules.add(clean);
								}

								log(this);
								_context2.next = 116;
								break;

							case 112:
								_context2.prev = 112;
								_context2.t3 = _context2['catch'](0);

								log(_context2.t3);
								throw _context2.t3;

							case 116:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, this, [[0, 112], [21, 25, 29, 37], [30,, 32, 36], [61, 73, 77, 85], [78,, 80, 84], [91, 95, 99, 107], [100,, 102, 106]]);
			}));

			function parse(_x7, _x8) {
				return ref.apply(this, arguments);
			}

			return parse;
		}()
	}]);

	return Target;
}();

var Makefile = exports.Makefile = function () {
	function Makefile() {
		_classCallCheck(this, Makefile);

		this.targets = new Set();
		this.imported = new Set();
	}

	_createClass(Makefile, [{
		key: 'load',
		value: function () {
			var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(build) {
				var name, target, imports, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, modname, modpkg, mod, t, _name, _target, merges, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, merge;

				return regeneratorRuntime.wrap(function _callee3$(_context3) {
					while (1) {
						switch (_context3.prev = _context3.next) {
							case 0:
								_context3.prev = 0;

								reduce(build);
								combine(build);

								if (!build['+']) {
									_context3.next = 7;
									break;
								}

								build = build['+'];
								_context3.next = 8;
								break;

							case 7:
								throw new Error('No targets');

							case 8:
								_context3.t0 = regeneratorRuntime.keys(build);

							case 9:
								if ((_context3.t1 = _context3.t0()).done) {
									_context3.next = 53;
									break;
								}

								name = _context3.t1.value;

								if (build[name].import) {
									_context3.next = 13;
									break;
								}

								return _context3.abrupt('continue', 9);

							case 13:
								target = build[name];
								imports = new Set(target.import);
								_iteratorNormalCompletion7 = true;
								_didIteratorError7 = false;
								_iteratorError7 = undefined;
								_context3.prev = 18;
								_iterator7 = imports[Symbol.iterator]();

							case 20:
								if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
									_context3.next = 37;
									break;
								}

								modname = _step7.value;

								if (!this.imported.has(modname)) {
									_context3.next = 24;
									break;
								}

								return _context3.abrupt('continue', 34);

							case 24:

								this.imported.add(modname);

								modpkg = require(_path2.default.join(modname, 'package.json'));


								if (!modpkg.build.name) modpkg.build.name = modpkg.name;

								if (!modpkg.build.version) modpkg.build.version = modpkg.version;

								modpkg.build.modname = modname;
								modpkg.build.home = _path2.default.relative(_path2.default.dirname(module.filename), _path2.default.dirname(require.resolve(modname)));

								_context3.next = 32;
								return this.load(modpkg.build);

							case 32:
								mod = _context3.sent;


								for (t in mod) {
									build[modname + '_' + t] = mod[t];
								}

							case 34:
								_iteratorNormalCompletion7 = true;
								_context3.next = 20;
								break;

							case 37:
								_context3.next = 43;
								break;

							case 39:
								_context3.prev = 39;
								_context3.t2 = _context3['catch'](18);
								_didIteratorError7 = true;
								_iteratorError7 = _context3.t2;

							case 43:
								_context3.prev = 43;
								_context3.prev = 44;

								if (!_iteratorNormalCompletion7 && _iterator7.return) {
									_iterator7.return();
								}

							case 46:
								_context3.prev = 46;

								if (!_didIteratorError7) {
									_context3.next = 49;
									break;
								}

								throw _iteratorError7;

							case 49:
								return _context3.finish(46);

							case 50:
								return _context3.finish(43);

							case 51:
								_context3.next = 9;
								break;

							case 53:
								_context3.t3 = regeneratorRuntime.keys(build);

							case 54:
								if ((_context3.t4 = _context3.t3()).done) {
									_context3.next = 81;
									break;
								}

								_name = _context3.t4.value;

								if (build[_name].merge) {
									_context3.next = 58;
									break;
								}

								return _context3.abrupt('continue', 54);

							case 58:
								_target = build[_name];
								merges = new Set(_target.merge);
								_iteratorNormalCompletion8 = true;
								_didIteratorError8 = false;
								_iteratorError8 = undefined;
								_context3.prev = 63;


								for (_iterator8 = merges[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
									merge = _step8.value;

									reduceObjects(build[merge], _target);
								}
								_context3.next = 71;
								break;

							case 67:
								_context3.prev = 67;
								_context3.t5 = _context3['catch'](63);
								_didIteratorError8 = true;
								_iteratorError8 = _context3.t5;

							case 71:
								_context3.prev = 71;
								_context3.prev = 72;

								if (!_iteratorNormalCompletion8 && _iterator8.return) {
									_iterator8.return();
								}

							case 74:
								_context3.prev = 74;

								if (!_didIteratorError8) {
									_context3.next = 77;
									break;
								}

								throw _iteratorError8;

							case 77:
								return _context3.finish(74);

							case 78:
								return _context3.finish(71);

							case 79:
								_context3.next = 54;
								break;

							case 81:
								return _context3.abrupt('return', build);

							case 84:
								_context3.prev = 84;
								_context3.t6 = _context3['catch'](0);
								throw _context3.t6;

							case 87:
							case 'end':
								return _context3.stop();
						}
					}
				}, _callee3, this, [[0, 84], [18, 39, 43, 51], [44,, 46, 50], [63, 67, 71, 79], [72,, 74, 78]]);
			}));

			function load(_x9) {
				return ref.apply(this, arguments);
			}

			return load;
		}()
	}, {
		key: 'parse',
		value: function () {
			var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(build) {
				var makeVariables, calls, name, target, rules, clean;
				return regeneratorRuntime.wrap(function _callee4$(_context4) {
					while (1) {
						switch (_context4.prev = _context4.next) {
							case 0:
								_context4.prev = 0;
								makeVariables = new MakeVariables();
								calls = [];
								_context4.next = 5;
								return this.load(build);

							case 5:
								build = _context4.sent;


								for (name in build) {
									if (build[name].variables) makeVariables.append(build[name].variables);

									target = new Target();

									this.targets.add(target);
									calls.push(target.parse(name, build[name]));
								}

								_context4.next = 9;
								return Promise.all(calls);

							case 9:
								rules = new Set([].concat(_toConsumableArray(this.targets)).map(function (_ref6) {
									var rules = _ref6.rules;
									return rules;
								}).reduce(function (a, b) {
									return [].concat(_toConsumableArray(a), _toConsumableArray(b));
								}));
								clean = new LinkRule({ name: 'clean' });


								clean.append([].concat(_toConsumableArray(rules)).filter(function (rule) {
									return rule instanceof LinkRule && rule.depends.size && rule.commands.size;
								}).map(function (rule) {
									return 'clean-' + rule.name;
								}));

								rules.add(clean);

								if (makeVariables.list.size) rules = new Set([makeVariables].concat(_toConsumableArray(rules)));

								return _context4.abrupt('return', [['comma := ,', 'empty:=', 'space:= $(empty) $(empty)', 'destdir ?=', 'prefix ?= /usr', 'installdir := ${destdir}${prefix}', '.DEFAULT_GOAL := all'].join('\n')].concat(_toConsumableArray(rules)).join('\n\n'));

							case 17:
								_context4.prev = 17;
								_context4.t0 = _context4['catch'](0);
								throw _context4.t0;

							case 20:
							case 'end':
								return _context4.stop();
						}
					}
				}, _callee4, this, [[0, 17]]);
			}));

			function parse(_x10) {
				return ref.apply(this, arguments);
			}

			return parse;
		}()
	}]);

	return Makefile;
}();

exports.default = function () {
	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(build) {
		var _makefile;

		return regeneratorRuntime.wrap(function _callee5$(_context5) {
			while (1) {
				switch (_context5.prev = _context5.next) {
					case 0:
						_context5.prev = 0;
						_makefile = new Makefile();
						_context5.next = 4;
						return _makefile.parse(build);

					case 4:
						_context5.t0 = _context5.sent;
						_context5.next = 7;
						return writeFile('makefile', _context5.t0);

					case 7:
						_context5.next = 12;
						break;

					case 9:
						_context5.prev = 9;
						_context5.t1 = _context5['catch'](0);
						throw _context5.t1;

					case 12:
					case 'end':
						return _context5.stop();
				}
			}
		}, _callee5, this, [[0, 9]]);
	}));

	function makefile(_x11) {
		return ref.apply(this, arguments);
	}

	return makefile;
}();

if (require.main === module) _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
	var make, out;
	return regeneratorRuntime.wrap(function _callee6$(_context6) {
		while (1) {
			switch (_context6.prev = _context6.next) {
				case 0:
					_context6.prev = 0;
					make = new Makefile();
					_context6.next = 4;
					return make.parse(require('./package.json').build);

				case 4:
					out = _context6.sent;

					log(out);
					require('fs').writeFile('makefile', out);
					_context6.next = 13;
					break;

				case 9:
					_context6.prev = 9;
					_context6.t0 = _context6['catch'](0);

					log(_context6.t0);
					throw _context6.t0;

				case 13:
				case 'end':
					return _context6.stop();
			}
		}
	}, _callee6, this, [[0, 9]]);
}))();
