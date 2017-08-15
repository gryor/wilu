import debug from 'debug';
import path from 'path';
import glob from 'glob';
import minimatch from 'minimatch';
import fs from 'fs';

let log = debug('wilu');


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
		return new Promise(function(success, fail) {
			fs.writeFile(path, content, (error) => (error ? fail(error) : success()));
		});
	} catch (e) {
		throw e;
	}
}

let _cache_aglob = new Map();

function aglob(pattern, options) {
	try {
		let cacheKey = JSON.stringify({pattern, options});

		if(_cache_aglob.has(cacheKey))
			return Promise.resolve(_cache_aglob.get(cacheKey));
		else
			return new Promise(function(success, fail) {
				glob(pattern, options, function (error, results) {
					if(error)
						fail(error);
					else {
						_cache_aglob.set(cacheKey, results);
						success(results);
					}
				});
			});
	} catch(e) {
		throw e;
	}
}

function reduceObjects(parent, child, iterating = false) {
	try {
		for(let property in parent) {
			if(property === '+' && !iterating) {
				continue;
			} else if(child[property] === undefined) {
				child[property] = parent[property];
			} else if(Array.isArray(parent[property]) && Array.isArray(child[property])) {
				child[property] = [...parent[property], ...child[property]];
			} else if(isObject(parent[property]) && isObject(child[property])) {
				reduceObjects(parent[property], child[property], true);
			}
		}
	} catch (e) {
		throw e;
	}
}

function reduce(parent) {
	try {
		let childs = parent['+'];

		for(let name in childs) {
			let child = childs[name];

			if(!isObject(child))
				continue;

			reduceObjects(parent, child);
			reduce(child);
		}
	} catch(e) {
		throw e;
	}
}

function combine(parent, childs) {
	try {
		childs = childs || parent['+'];

		for(let name in childs) {
			let grandchilds = childs[name]['+'];

			if(!isObject(grandchilds))
				continue;

			for(let gname in grandchilds) {
				if(parent['+'][gname] === undefined)
					parent['+'][gname] = grandchilds[gname];
			}

			combine(parent, grandchilds);
			delete childs[name]['+'];
		}
	} catch (e) {
		throw e;
	}
}

export class Version {
	major = 0;
	minor = 0;
	patch = 1;

	constructor(version) {
		if(version)
			[this.major, this.minor, this.patch] = version.split('.');
	}

	toString() {
		return `${this.major}.${this.minor}.${this.patch}`;
	}
}

export class Options {
	list = new Set();
	raw = new Set();
	preline = '';
	prefix = '';
	suffix = '';
	join = ' ';

	constructor({preline, prefix, suffix, join} = {}) {
		if(prefix)
			this.prefix = prefix;

		if(suffix)
			this.suffix = suffix;

		if(join)
			this.join = join;

		if(preline)
			this.preline = preline;

		if(preline && join === undefined)
			this.join = ',';
	}

	toString() {
		try {
			if(!this.raw.size && !this.list.size)
				return '';

			let line = [...this.raw];

			if(this.list.size) {
				line = [...line, this.preline + [...this.list].map((item) => (this.prefix + item + this.suffix)).join(this.join)];
			}

			return line.join(' ');
		} catch(e) {
			throw e;
		}
	}

	append(values) {
		try {
			if(values)
				this.list = new Set([...this.list, ...values]);
		} catch(e) {
			throw e;
		}
	}

	prepend(values) {
		try {
			if(values)
				this.list = new Set([...values, ...this.list]);
		} catch(e) {
			throw e;
		}
	}
}

export class Tool {
	name = '';
	options = new Set();

	constructor({name, toolset} = {}) {
		if(name)
			this.name = name;

		if(toolset)
			this.name = toolset + '-' + name;
	}

	toString() {
		try {
			return [this.name, ...[...this.options]
				.filter((item) => (!!item))
				.map((opt) => opt.toString())]
				.filter((item) => (item && item.length > 0))
				.join(' ');
		} catch(e) {
			throw e;
		}
	}
}

export class CompileRule {
	targets = new Set();
	commands = new Set();
	extension = null;
	directory = null;
	src = null;

	constructor({extension, directory, src} = {}) {
		if(extension)
			this.extension = extension;

		if(directory)
			this.directory = directory;

		if(src)
			this.src = src;
	}

	toString() {
		try {
			return [...this.targets].join(' ')
			+ ': ' + path.join(this.directory, '%' + (this.extension ? ('.' + this.extension) + ': %' : ': ' + path.join(this.src, '%')))
			+ [...this.commands].map((cmd) => (`\n\t@${cmd}`)).join('');
		} catch(e) {
			throw e;
		}
	}

	append(values) {
		try {
			if(values)
				this.targets = new Set([...this.targets, ...values]);
		} catch(e) {
			throw e;
		}
	}
}

export class LinkRule {
	name = '';
	depends = new Set();
	commands = new Set();

	constructor({name} = {}) {
		if(name)
			this.name = name;
	}

	toString() {
		try {
			return this.name
			+ ': '
			+ [...this.depends].join(' ')
			+ [...this.commands].map((cmd) => (`\n\t@${cmd}`)).join('');
		} catch(e) {
			throw e;
		}
	}

	append(values) {
		try {
			if(values)
				this.depends = new Set([...this.depends, ...values]);
		} catch(e) {
			throw e;
		}
	}
}

export class MakeVariables {
	list = new Map();

	toString() {
		try {
			return [...this.list].map((v) => (v[0] + '= ' + v[1])).join('\n');
		} catch(e) {
			throw e;
		}
	}

	append(values) {
		try {
			if(!values)
				return;

			for(let property in values)
				this.list.set(property, values[property]);
		} catch(e) {
			throw e;
		}
	}
}

export class Sources {
	includes = new Set();
	excludes = new Set();
	path = undefined;
	_cache = null;

	constructor({path} = {}) {
		if(path)
			this.path = path;
	}

	include(values) {
		try {
			if(values)
				this.includes = new Set([...this.includes, ...values]);
		} catch(e) {
			throw e;
		}
	}

	exclude(values) {
		try {
			if(values)
				this.excludes = new Set([...this.excludes, ...values]);
		} catch(e) {
			throw e;
		}
	}

	async files() {
		try {
			if(this._cache)
				return this._cache;

			if(!this.includes.size)
				return new Set();

			for(let exclude of this.excludes) {
				this.includes.delete(exclude);
			}

			this._cache = await Promise.all([...this.includes].map((pattern) => aglob(pattern, {cwd: this.path})));
			this._cache = this._cache.reduce((all, current) => [...all, ...current]);

			for(let exclude of this.excludes)
				this._cache = this._cache.filter((file) => !minimatch(file, exclude));

			this._cache = new Set(this._cache);

			return this._cache;
		} catch(e) {
			throw e;
		}
	}

	organize(rules) {
		try {
			let result = new Map();

			if(this._cache) {
				for(let [type, exts] of rules) {
					let matches = new Set(
						[...exts]
						.map((ext) => minimatch.match([...this._cache], '*.' + ext, {matchBase: true}))
						.reduce((a, b) => [...a, ...b])
					);

					if(matches.size)
						result.set(type, matches);
				}
			}

			return result;
		} catch(e) {
			throw e;
		}
	}

	toString() {
		try {
			if(!this._cache)
				return '';

			return [...this._cache].join(' ');
		} catch(e) {
			throw e;
		}
	}
}

export class Target {
	target = '';
	name = '';
	libname = '';
	version = new Version('0.0.1');
	library = false;
	shared = false;
	directories = {
		base: 'build',
		output: 'bin',
		objects: 'obj'
	};
	options = {
		compiler: new Map(),
		assembler: new Options({preline: '-Wa,', prefix: '-'}),
		linker: new Options({preline: '-Wl,', prefix: '-'}),
		scripts: new Options({prefix: '-T'}),
		machine: new Options({prefix: '-m'}),
		definitions: new Options({prefix: '-D'}),
		libraries: {
			static: new Options({prefix: '-l:lib', suffix: '.a'}),
			shared: new Options({prefix: '-l:lib', suffix: '.so'})
		},
		search: {
			includes: new Options({prefix: '-I'}),
			libraries: new Options({prefix: '-L'}),
			scripts: new Options({preline: '-Wl,', prefix: '-L'})
		}
	};
	extensions = new Map();
	depends = new Set();
	sources = new Sources();
	tools = new Map();
	linker = null;
	rules = new Set();
	objects = new Set();

	async parse(name, target) {
		try {
			log({name, target});

			this.target = name;
			this.name = target.name || 'app';

			if(target.version)
				this.version = new Version(target.version);

			if(target.library) {
				this.library = true;
				this.shared = !!target.shared;

				this.options.compiler.set('all', new Options({prefix: '-'}));
				this.options.compiler.get('all').append(['fPIC']);

				if(this.shared) {
					this.libname = `lib${this.name}.so.${this.version}`;
					this.options.linker.raw.add('-shared');
					this.options.linker.raw.add('-fPIC');
					this.options.linker.list.add(`soname,lib${this.name}.so.${this.version.major}`);
				} else {
					this.libname = `lib${this.name}.a`;
					this.options.linker = new Options();
					this.options.linker.raw.add('rcs');
					this.linker = new Tool({name: 'ar', toolset: target.toolset});
				}
			}

			Object.assign(this.directories, target.directories);

			this.directories.base = path.join(this.directories.base, this.name);

			if(target.options) {
				for(let type in target.options.compiler) {
					let options = this.options.compiler.get(type) || new Options({prefix: '-'});
					options.append(target.options.compiler[type]);
					this.options.compiler.set(type, options);
				}

				this.options.assembler.append(target.options.assembler);
				this.options.linker.append(target.options.linker);
				this.options.scripts.append(target.scripts);
				this.options.machine.append(target.machine);
				this.options.definitions.append(target.definitions);

				if(target.libraries) {
					this.options.libraries.static.append(target.libraries.static);
					this.options.libraries.shared.append(target.libraries.shared);
				}

				if(target.search) {
					if(target.home) {
						for(let search in target.search) {
							this.options.search[search].append(target.search[search]
							.map((p) => (path.isAbsolute(p) ? p : path.join(target.home, p))));
						}
					}

					this.options.search.includes.append(target.search.includes);
					this.options.search.libraries.append(target.search.libraries);
					this.options.search.scripts.append(target.search.scripts);
				}

				if(target.options.raw) {
					if(target.options.raw.linker) {
						for(let opt of target.options.raw.linker)
							this.options.linker.raw.add(opt);
					}
				}
			}

			target.extensions = target.extensions || {};
			target.extensions.c = target.extensions.c || ['c'];
			target.extensions.asm = target.extensions.asm || ['s', 'S'];
			target.extensions['c++'] = target.extensions['c++'] || ['cc', 'cpp'];
			target.extensions.copy = target.extensions.copy || ['h', 'hpp'];

			for(let type in target.extensions) {
				this.extensions.set(type, new Set(target.extensions[type]));
			}

			if(target.depends) {
				this.depends = new Set(target.depends);

				if(target.home) {
					let imports = new Set(target.import || []);

					this.depends = new Set([...this.depends].map(function (d) {
						let modname = d.split('_')[0];

						if(modname.length && imports.has(modname))
							return d;

						return `${target.modname}_${d}`;
					}));
				}
			}

			if(target.sources) {
				this.sources.path = target.sources.path || 'src';

				if(target.home)
					this.sources.path = path.join(target.home, this.sources.path);

				if(target.sources.subpath)
					this.sources.path = path.join(this.sources.path, target.sources.subpath);

				this.sources.include(target.sources.include);
				this.sources.exclude(target.sources.exclude);
			}

			await this.sources.files();

			let files = this.sources.organize(this.extensions);

			target.tools = target.tools || {};

			if(!target.tools.c)
				target.tools.c = 'gcc';

			if(!target.tools.asm)
				target.tools.asm = 'gcc -x assembler-with-cpp';

			if(!target.tools['c++'])
				target.tools['c++'] = 'g++';

			for(let type in target.tools) {
				let tool = new Tool({name: target.tools[type], toolset: target.toolset});

				if(this.options.compiler.has('all'));
				tool.options.add(this.options.compiler.get('all'));

				if(this.options.compiler.has(type));
				tool.options.add(this.options.compiler.get(type));

				tool.options.add(this.options.machine);
				tool.options.add(this.options.definitions);
				tool.options.add(this.options.assembler);
				tool.options.add(this.options.search.includes);

				this.tools.set(type, tool);
			}

			if(!this.linker) {
				let linker = null;

				if(files.has('c++'))
					linker = this.tools.get('c++').name;
				else if(files.has('c'))
					linker = this.tools.get('c').name;
				else
					linker = 'gcc';

				this.linker = new Tool({name: linker});
			}

			this.linker.options.add(this.options.linker);

			if(!(this.library && !this.shared)) {
				this.linker.options.add(this.options.machine);
				this.linker.options.add(this.options.definitions);
				this.linker.options.add(this.options.search.libraries);
				this.linker.options.add(this.options.search.scripts);
				this.linker.options.add(this.options.scripts);
				this.linker.options.add(this.options.libraries.shared);
			}

			let link = new LinkRule({name: this.target});

			if(this.depends.size)
				link.append(this.depends);

			for(let [type, tool] of this.tools) {
				if(!files.has(type))
					continue;

				let directory = path.join(this.directories.base, this.directories.objects, this.target);
				let objects = [...files.get(type)].map((file) => path.join(directory, this.sources.path, file + '.o'));
				this.objects = new Set([...this.objects, ...objects]);

				let rule = new CompileRule({extension: 'o', directory});
				rule.append(objects);
				rule.commands.add('mkdir -p ${dir $@}');
				rule.commands.add(tool + ' -c $< -o $@')
				this.rules.add(rule);
			}

			if(this.objects.size || this.options.libraries.static.list.size) {
				link.append(this.objects);

				link.commands.add([
					'mkdir -p',
					path.join(this.directories.base, this.directories.output)
				].join(' '));

				let output = path.join(this.directories.base, this.directories.output,
									   (this.library ? this.libname : this.name));

				if(this.library && !this.shared)
					link.commands.add([this.linker, output, ...this.objects].join(' '));
				else {
					link.commands.add([this.linker, ...this.objects, this.options.libraries.static, '-o', output]
					.map((e) => e.toString())
					.filter((e) => (e && e.length > 0))
					.join(' '));
				}

				if(this.library && this.shared) {
					link.commands.add([
						'ln -sf',
						this.libname,
						path.join(this.directories.base, this.directories.output, `lib${this.name}.so`)
					].join(' '));

					link.commands.add([
						'ln -sf',
						this.libname,
						path.join(this.directories.base, this.directories.output, `lib${this.name}.so.${this.version.major}`)
					].join(' '));

					link.commands.add([
						'ln -sf',
						this.libname,
						path.join(this.directories.base, this.directories.output,
								  `lib${this.name}.so.${this.version.major}.${this.version.minor}`)
					].join(' '));
				}
			}

			if(files.has('copy')) {
				let directory = path.join(this.directories.base, this.directories.output);
				let rule = new CompileRule({directory, src: this.sources.path});
				let targets = [...files.get('copy')].map((file) => path.join(directory, file));
				rule.append(targets);
				rule.commands.add('mkdir -p ${dir $@}');
				rule.commands.add([
					'cd',
					this.sources.path + '; cp --parents -t',
					path.relative(
						path.join(process.cwd(), this.sources.path),
						path.join(process.cwd(), directory)
					),
					'$*'
				].join(' '));


				this.rules.add(rule);
				link.append(targets);
			}

			if(target.commands) {
				for(let cmd of target.commands) {
					if(this.sources && this.sources.path !== undefined)
						link.commands.add(['cd', this.sources.path + ';', cmd].join(' '));
					else
						link.commands.add(cmd);
				}
				
			}

			this.rules.add(link);

			if(files.size || this.options.libraries.static.list.size) {
				let clean = new LinkRule({name: 'clean-' + this.target});
				clean.commands.add('rm -rf ' + path.join(this.directories.base, this.directories.output));
				this.rules.add(clean);
			}


			log(this);
		} catch(e) {
			log(e);
			throw e;
		}
	}
}

export class Makefile {
	targets = new Set();
	imported = new Set();

	async load(build) {
		try {
			reduce(build);
			combine(build);

			if(build['+'])
				build = build['+'];
			else
				throw new Error('No targets');

			for(let name in build) {
				if(!build[name].import)
					continue;

				let target = build[name];
				let imports = new Set(target.import);
				let homepath = path.dirname(module.parent ? module.parent.filename : module.filename)

				for(let modname of imports) {
					if(this.imported.has(modname))
						continue;

					let modpath = path.dirname(require.resolve(modname));

					this.imported.add(modname);

					let modpkg = require(path.join(modpath, 'package.json'));

					if(!modpkg.build.name)
						modpkg.build.name = modpkg.name;

					if(!modpkg.build.version)
						modpkg.build.version = modpkg.version;

					modpkg.build.modname = modname;
					modpkg.build.home = path.relative(homepath, modpath);

					let mod = await this.load(modpkg.build);

					for(let t in mod) {
						build[modname + '_' + t] = mod[t];
					}
				}
			}

			for(let name in build) {
				if(!build[name].merge)
					continue;

				let target = build[name];
				let merges = new Set(target.merge);

				for(let merge of merges) {
					reduceObjects(build[merge], target);
				}
			}

			return build;
		} catch(e) {
			throw e;
		}
	}

	async parse(build) {
		try {
			let makeVariables = new MakeVariables();
			let calls = [];

			build = await this.load(build);

			for(let name in build) {
				if(build[name].variables)
					makeVariables.append(build[name].variables);

				let target = new Target;
				this.targets.add(target);
				calls.push(target.parse(name, build[name]));
			}

			await Promise.all(calls);

			let rules = new Set([...this.targets].map(({rules}) => rules).reduce((a, b) => [...a, ...b]));
			let clean = new LinkRule({name: 'clean'});

			clean.append([...rules].filter((rule) => (rule instanceof LinkRule && rule.name.startsWith('clean-') && rule.commands.size)).map((rule) => rule.name));

			rules.add(clean);

			if(makeVariables.list.size)
				rules = new Set([makeVariables, ...rules]);

			return [[
				'comma := ,',
				'empty:=',
				'space:= $(empty) $(empty)',
				'destdir ?=',
				'prefix ?= /usr',
				'installdir := ${destdir}${prefix}',
				'.DEFAULT_GOAL := all'
			].join('\n'), ...rules].join('\n\n');
		} catch(e) {
			throw e;
		}
	}
}

export default async function makefile(build) {
	try {
		let makefile = new Makefile();
		await writeFile('makefile', await makefile.parse(build));
	} catch(e) {
		throw e;
	}
}

if(require.main === module)
	(async function () {
		try {
			let make = new Makefile();
			let out = await make.parse(require('./package.json').build);
			log(out);
			require('fs').writeFile('makefile', out);
		} catch(e) {
			log(e);
			throw e;
		}
	})();
