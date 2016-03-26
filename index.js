import debug from 'debug';
import path from 'path';
import glob from 'glob';
import minimatch from 'minimatch';

let log = debug('wilu');


function isObject(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Object.prototype);
}

function isSet(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Set.prototype);
}

function parseObject(obj, iterating = false) {
	try {
		for(let property in obj) {
		if(Array.isArray(obj[property])) {
			obj[property] = new Set(obj[property]);
		} else if(obj[property] === null) {
			delete obj[property];
		} else if(property === '+' && !iterating) {
			continue;
		} else if(isObject(obj[property])) {
			obj[property] = parseObject(obj[property], true);
		}
	}
	} catch (e) {
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
			} else if(child[property] === null) {
				delete child[property];
			} else if(isSet(parent[property]) && Array.isArray(child[property])) {
				child[property] = new Set([...parent[property], ...child[property]]);
			} else if(isObject(parent[property]) && isObject(child[property])) {
				reduceObjects(parent[property], child[property], true);
			}
		}

		for(let property in child) {
			if(Array.isArray(child[property]))
				child[property] = new Set(child[property]);
		}
	} catch (e) {
		throw e;
	}
}

function reduce(parent) {
	try {
		parseObject(parent);
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

function targets(info) {
	reduce(info.build);
	combine(info.build);
	if(info.build['+'])
		info.build = info.build['+'];
}

function aglob(pattern, options) {
	try {
		return new Promise(function(success, fail) {
			glob(pattern, options, function (error, results) {
				if(error)
					fail(error);
				else
					success(results);
			});
		});
	} catch(e) {
		throw e;
	}
}

async function sources(info) {
	try {
		for(let name in info.build) {
			let target = info.build[name];
			target.sources = target.sources || {};
			let src = target.sources;
			src.extensions = src.extensions || {c: new Set(['c']), 'c++': new Set(['cc', 'cpp']), asm: new Set(['s', 'S'])};

			if(src.path === undefined)
				src.path = 'src';

			if(src.subpath) {
				src.path = path.join(src.path, src.subpath);
				delete src.subpath;
			}

			if(src.include === undefined)
				src.include = new Set(['**/*.c']);

			if(isSet(src.include) && src.path !== null) {
				if(isSet(src.exclude)) {
					for(let exclude of src.exclude) {
						src.include.delete(exclude);
					}
				}

				src.include = await Promise.all([...src.include].map((pattern) => aglob(pattern, {cwd: src.path})));
				src.include = src.include.reduce((all, current) => [...all, ...current]);

				if(isSet(src.exclude)) {
					for(let exclude of src.exclude)
						src.include = src.include.filter((include) => !minimatch(include, exclude));
				}

				src.include = src.include.map((include) => path.join(src.path, include));
				src.include = [...new Set(src.include)];
				src.path = null;

				if(src.include.size === 0)
					continue;

				for(let type in src.extensions) {
					src.extensions[type] = new Set([...src.extensions[type]]
												   .map((ext) => minimatch.match(src.include, '*.' + ext, {matchBase: true}))
												   .reduce((a, b) => [...a, ...b]));

												   if(src.extensions[type].size === 0)
													   delete src.extensions[type];
				}

				target.sources = src.extensions;
			}
		}
	} catch(e) {
		throw e;
	}
}

function prefix(set, text) {
	return [...set].map((item) => text + item);
}

function suffix(set, text) {
	return [...set].map((item) => item + text);
}

function initTarget(info, target) {
	try {
	target.name = target.name || info.name || 'app';
	target.version = target.version || info.version || '0.0.1';
	target.directory = target.directory || 'build';
	target.objdirectory = target.objdirectory || 'obj';
	target.subdirectory = target.subdirectory || 'bin';
	target.compilers = target.compilers || {};
	target.compiler = target.compiler || {};
	target.compiler.flags = target.compiler.flags || {};
	target.compiler.flags.always = target.compiler.flags.always || new Set();
	target.machine = target.machine || new Set();
	target.definitions = target.definitions || new Set();
	target.linker = target.linker || {};
	target.linker.flags = target.linker.flags || new Set();
	target.linker.scripts = target.linker.scripts || new Set();
	target.assembler = target.assembler || {};
	target.assembler.flags = target.assembler.flags || new Set();
	target.libraries = target.libraries || new Set();
	target.search = target.search || {};
	target.search.includes = target.search.includes || new Set();
	target.search.libraries = target.search.libraries || new Set();
	target.search.scripts = target.search.scripts || new Set();
	target.objdirectory = path.join(target.directory, target.objdirectory);
	target.subdirectory = path.join(target.directory, target.subdirectory);

	if(target.toolset && target.toolset.length)
		target.toolset += '-';
	else
		target.toolset = '';

	if(target.compilers.c === undefined)
		target.compilers.c = 'gcc';

	if(target.compilers['c++'] === undefined)
		target.compilers['c++'] = 'g++';

	if(target.compilers.asm === undefined)
		target.compilers.asm = 'gcc -x --assembler-with-cpp';

	if(isSet(target.machine))
		target.machine = prefix(target.machine, '-m').join(' ');
	if(isSet(target.definitions))
		target.definitions = prefix(target.definitions, '-D').join(' ');
	if(isSet(target.linker.flags))
		target.linker.flags = prefix(target.linker.flags, '-Wl,-').join(' ');
	if(isSet(target.linker.scripts))
		target.linker.scripts = prefix(target.linker.scripts, '-T').join(' ');
	if(isSet(target.assembler.flags))
		target.assembler.flags = prefix(target.assembler.flags, '-Wa,-').join(' ');
	if(isSet(target.libraries))
		target.libraries = prefix(target.libraries, '-l').join(' ');
	if(isSet(target.search.includes))
		target.search.includes = prefix(target.search.includes, '-I').join(' ');
	if(isSet(target.search.libraries))
		target.search.libraries = prefix(target.search.libraries, '-L').join(' ');
	if(isSet(target.search.scripts))
		target.search.scripts = prefix(target.search.scripts, '-Wl,-L').join(' ');

	for(let type in target.compiler.flags) {
		if(isSet(target.compiler.flags[type]))
			target.compiler.flags[type] = prefix(target.compiler.flags[type], '-').join(' ');
	}
	} catch (e) {
		throw e;
	}
}

async function makefile(info) {
	try {
		if(!info.build)
			throw new Error('package.json:build is not defined');

		targets(info);
		await sources(info);

		let out = [];
		let outdirs = new Set();

		for(let name in info.build) {
			let target = info.build[name];

			initTarget(info, target);

			let compilers = target.compilers;
			let linker = target.toolset + (target.sources['c++'] ? target.compilers['c++'] : target.compilers['c']);
			let src = target.sources;
			let targetObjects = [];

			for(let type in src) {
				let objects = suffix(src[type], '.o');
				targetObjects = targetObjects.concat(objects);
				let compiler = target.toolset + target.compilers[type];
				let flags = target.compiler.flags.always;

				if(target.compiler.flags[type])
					flags += ' ' + target.compiler.flags[type];

				let compile = [
					objects.join(' ') + ': %.o: %\n\t@' + compiler,
					flags,
					target.machine,
					target.definitions,
					target.search.includes,
					target.assembler.flags,
					'-c $< -o',
					path.join(target.objdirectory, name, '$@')
				];

				compile = compile.filter((e) => !(!e || e.length === 0)).join(' ');
				out.push(compile);
			}

			if(targetObjects.length === 0)
				continue;

				targetObjects = [...new Set(targetObjects)];

				outdirs.add(target.directory);

				let builtObjects = prefix(targetObjects, path.join(target.objdirectory, name) + path.sep);
				let dirs = [target.subdirectory, ...new Set(builtObjects.map((o) => path.dirname(o)))].join(' ');
				let mkdirs = [dirs + ':\n\t@mkdir -p ' + dirs];

				// linker erikseen, kerää tiedot kaikista kielistä!
				let link = [
					name + ':',
					dirs,
					targetObjects.join(' ') + '\n\t@' + linker,
					target.linker.flags,
					target.linker.scripts,
					target.machine,
					target.definitions,
					target.libraries,
					target.search.libraries,
					target.search.scripts,
					builtObjects.join(' '),
					'-o',
					path.join(target.subdirectory, target.name)
				];

				link = link.filter((e) => !(!e || e.length === 0)).join(' ');
				out.push(mkdirs, link);
		}

		if(outdirs.size)
			out.push('clean:\n\t-@rm -rf ' + [...outdirs].join(' '));

		out = out.filter((e) => !(!e || e.length === 0));
		out = out.join('\n\n');

		if(out.length)
			out += '\n';

		return out;
	} catch(e) {
		throw e;
	}
}

export default makefile;

if(require.main === module) {
(async function () {
	try {
		log('makefile', '\n' + await makefile(require('./package.json')));
	} catch (e) {
			log(e);
			throw e;
	}
})();
}
