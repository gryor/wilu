const debug = require('debug');
const npath = require('path');
const glob = require('glob');
const minimatch = require('minimatch');
const fs = require('fs');

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

class Path {
	constructor() {
		try {
			this.current = '';

			for(let i = 0; i <  arguments.length; i++) {
				if(arguments[i] === undefined)
					throw new Error('undefined path');

				let e = arguments[i] = arguments[i].toString();

				if(e.length > 1 && e.endsWith(npath.sep))
					arguments[i] = e.slice(0, -1);
			}

			if(arguments.length > 1)
				this.add(...arguments);
			else if(arguments.length === 1)
				this.current = arguments[0];
		} catch(e) {
			throw(e);
		}
	}

	toString() {
		return this.current;
	}

	add() {
		if(this.current.length > 0)
			this.current = [this.current, ...arguments].join(npath.sep);
		else
			this.current = [...arguments].join(npath.sep);
	}

	join() {
		try {
			return new Path(this.current, ...arguments);
		} catch(e) {
			throw(e);
		}
	}

	joinEach(paths) {
		try {
			if(!(paths instanceof Set))
				paths = new Set(paths);

			paths = [...paths].map(e => this.join(e));
		} catch(e) {
			throw(e);
		}
	}

	absolute() {
		try {
			return new Path(npath.resolve(this.current));
		} catch(e) {
			throw(e);
		}
	}

	isAbsolute() {
		return npath.isAbsolute(this.current);
	}

	relative(to) {
		try {
			return new Path(npath.relative(this.current, to.toString()));
		} catch(e) {
			throw(e);
		}
	}

	normalize() {
		try {
			return new Path(npath.normalize(this.current));
		} catch(e) {
			throw(e);
		}
	}

	dirname() {
		try {
			return new Path(npath.dirname(this.current));
		} catch(e) {
			throw(e);
		}
	}

	basename() {
		return npath.basename(this.current, ...arguments);
	}

	extname() {
		return npath.extname(this.current);
	}

	updirs() {
		const updir = '..' + npath.sep;
		let count = 0;

		while(this.current.startsWith(updir, updir.length * count))
			count++;

		return count;
	}

	withoutUpdirs() {
		try {
			const updir = '..' + npath.sep;
			return new Path(this.current.slice(updir.length * this.updirs()));
		} catch(e) {
			throw(e);
		}
	}
}

class Paths {
	constructor() {
		try {
			this.home = new Path(npath.relative('.', npath.dirname(module.parent ? module.parent.filename : module.filename)));
		} catch(e) {
			throw(e);
		}
	}

	module(name) {
		try {
			return this.home.relative(npath.dirname(require.resolve(name)));
		} catch(e) {
			throw(e);
		}
	}
}

let paths = new Paths();

class Version {
	constructor(version) {
		this.major = 0;
		this.minor = 0;
		this.patch = 1;

		if(version)
			[this.major, this.minor, this.patch] = version.split('.');
	}

	toString() {
		return `${this.major}.${this.minor}.${this.patch}`;
	}
}

class Options {
	constructor({preline, prefix, suffix, join} = {}) {
		this.list = new Set();
		this.raw = new Set();
		this.preline = preline || '';
		this.prefix = prefix || '';
		this.suffix = suffix || '';
		this.join = join || ' ';

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

class Tool {
	constructor({name, toolset} = {}) {
		this.options = new Set();
		this.name = name || '';

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

class CompileRule {
	constructor({extension, directory, src, updirs} = {}) {
		try {
			this.targets = new Set();
			this.commands = new Set();

			if(extension)
				this.extension = extension;
			else
				this.src = new Path(src);
			
			this.directory = new Path(directory);

			this.updirs = updirs || '';
		} catch(e) {
			throw(e);
		}
	}

	toString() {
		try {
			return [...this.targets].join(' ')
			+ ': ' + this.directory.join('%' + (this.extension ? ('.' + this.extension) + ': ' + this.updirs + '%' : ': ' + this.updirs + this.src.join('%')))
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

class LinkRule {
	constructor({name} = {}) {
		this.depends = new Set();
		this.commands = new Set();
		this.name = name || '';
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

class MakeVariables {
	constructor() {
		this.list = new Map();
	}

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

class Sources {
	constructor({path} = {}) {
		try {
			this.includes = new Set();
			this.excludes = new Set();
			this.updirs = '';
			this._cache = null;

			if(path) {
				this.path = new Path(path);
			}
		} catch(e) {
			throw(e);
		}
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

			this.updirs = ('..' + npath.sep).repeat(this.path.updirs());
			this.pathWithoutUpdirs = this.path.withoutUpdirs();

			this._cache = await Promise.all([...this.includes].map((pattern) => aglob(pattern, {cwd: this.path.toString()})));
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

class Target {
	constructor() {
		this.target = '';
		this.name = '';
		this.libname = '';
		this.version = new Version('0.0.1');
		this.library = false;
		this.shared = false;
    this.node = false;
		this.directories = {
			base: 'build',
			output: 'bin',
			objects: 'obj'
		};
		this.options = {
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
		this.extensions = new Map();
		this.depends = new Set();
		this.sources = new Sources();
		this.tools = new Map();
		this.linker = null;
		this.rules = new Set();
		this.objects = new Set();
	}

	async parse(name, target) {
		try {
			//log({name, target});

			this.target = name;
			this.name = target.name || 'app';

			if(target.version)
				this.version = new Version(target.version);

      if(target.node) {
        this.node = true;
        target.library = true;
        target.shared = true;

        target.libraries = target.libraries || {};
        target.libraries.shared = new Set(target.libraries.shared || []);
        target.libraries.shared.add('v8');

        target.definitions = new Set(target.definitions || []);
        target.definitions.add('PIC');
        target.definitions.add('_LARGEFILE_SOURCE');
        target.definitions.add('_FILE_OFFSET_BITS=64');
        target.definitions.add('_GNU_SOURCE');
        target.definitions.add('EV_MULTIPLICITY=0');

        target.search = target.search || {};
        target.search.includes = new Set(target.search.includes || []);
        target.search.includes.add('/usr/include/node');
        target.search.includes.add('node_modules');
        target.directories = target.directories || {};

        if(target.directories.output === undefined)
          target.directories.output = 'lib';

        target.sources = target.sources || {};

        if(target.sources.include === undefined)
          target.sources.include = ['*.c'];
      }

			if(target.library) {
				this.library = true;
				this.shared = !!target.shared;

				this.options.compiler.set('all', new Options({prefix: '-'}));
				this.options.compiler.get('all').append(['fPIC']);

				if(this.shared) {
          if(this.node)
					  this.libname = `${this.name}.node`;
          else
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

			this.directories.base = new Path(this.directories.base);
			this.directories.base.add(target.modname);

			for(let key in this.directories) {
				if(key === 'base')
					continue;

				this.directories[key] = this.directories.base.join(this.directories[key]);
			}

			if(target.options) {
				for(let type in target.options.compiler) {
					let options = this.options.compiler.get(type) || new Options({prefix: '-'});
					options.append(target.options.compiler[type]);
					this.options.compiler.set(type, options);
				}

				this.options.assembler.append(target.options.assembler);
				this.options.linker.append(target.options.linker);

				if(target.options.raw) {
					if(target.options.raw.linker) {
						for(let opt of target.options.raw.linker)
							this.options.linker.raw.add(opt);
					}
				}
			}

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
						.map((p) => (npath.isAbsolute(p) ? p : target.home.join(p))));
					}
				}

				this.options.search.includes.append(target.search.includes);
				this.options.search.libraries.append(target.search.libraries);
				this.options.search.scripts.append(target.search.scripts);
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
					this.depends = new Set([...this.depends].map(d => (d.includes('_') ? d : `${target.modname}_${d}`)));
				}
			}

			if(target.sources) {
				this.sources.path = new Path(target.sources.path || 'src');

				if(target.home)
					this.sources.path = target.home.join(this.sources.path);

				if(target.sources.subpath)
					this.sources.path = this.sources.path.join(target.sources.subpath);

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

				let directory = this.directories.objects.join(this.target);
				let objects = [...files.get(type)].map((file) => directory.join(this.sources.pathWithoutUpdirs, file + '.o'));
				this.objects = new Set([...this.objects, ...objects]);

				let rule = new CompileRule({extension: 'o', directory, updirs: this.sources.updirs});
				rule.append(objects);
				rule.commands.add('mkdir -p ${dir $@}');
				rule.commands.add(tool + ' -c $< -o $@')
				this.rules.add(rule);
			}

			if(this.objects.size || this.options.libraries.static.list.size) {
				link.append(this.objects);

				link.commands.add([
					'mkdir -p',
					this.directories.output
				].join(' '));

				let output = this.directories.output.join(this.library ? this.libname : this.name);

				if(this.library && !this.shared)
					link.commands.add([this.linker, output, ...this.objects].join(' '));
				else {
					link.commands.add([this.linker, ...this.objects, this.options.libraries.static, '-o', output]
					.map((e) => e.toString())
					.filter((e) => (e && e.length > 0))
					.join(' '));
				}

				if(this.library && this.shared && !this.node) {
					link.commands.add([
						'ln -sf',
						this.libname,
						this.directories.output.join(`lib${this.name}.so`)
					].join(' '));

					link.commands.add([
						'ln -sf',
						this.libname,
						this.directories.output.join(`lib${this.name}.so.${this.version.major}`)
					].join(' '));

					link.commands.add([
						'ln -sf',
						this.libname,
						this.directories.output.join(`lib${this.name}.so.${this.version.major}.${this.version.minor}`)
					].join(' '));
				}
			}

			if(files.has('copy')) {
				let directory = this.directories.output;
				let rule = new CompileRule({directory, src: this.sources.path});
				let targets = [...files.get('copy')].map((file) => directory.join(file));
				rule.append(targets);
				rule.commands.add('mkdir -p ${dir $@}');
				rule.commands.add([
					'cd',
					this.sources.path + '; cp --parents -t',
					this.sources.path.absolute().relative(directory.absolute()),
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
				clean.commands.add('rm -rf ' + this.directories.output);
				this.rules.add(clean);
			}


			//log(this);
		} catch(e) {
			log(e);
			throw e;
		}
	}
}

class Makefile {
	constructor() {
		this.targets = new Set();
		this.imported = new Set();
	}

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

				for(let modname of imports) {
					if(this.imported.has(modname))
						continue;

					this.imported.add(modname);

					log('import module', modname);

					let modpath = paths.module(modname);
					let modpkg = require(npath.join(modname, 'package.json'));

					if(!modpkg.build.name)
						modpkg.build.name = modpkg.name;

					if(!modpkg.build.version)
						modpkg.build.version = modpkg.version;

					modpkg.build.modname = modname;
					modpkg.build.home = modpath;

					let mod = await this.load(modpkg.build);

					for(let t in mod) {
						let modtargetname = modname + '_' + t;

						if(mod[t].depends)
							mod[t].depends = mod[t].depends.map((d) => (d.includes('_') ? d : modname + '_' + d));

						build[modtargetname] = mod[t];
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

				let target = new Target();
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

module.exports = async function makefile(pkg) {
	try {
		pkg.build = pkg.build || {};
		Object.assign(pkg.build, {name: pkg.name, modname: pkg.name, version: pkg.version});
		let makefile = new Makefile();
		await writeFile('makefile', await makefile.parse(pkg.build));
	} catch(e) {
		throw e;
	}
}
