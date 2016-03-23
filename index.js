import debug from 'debug';
import path from 'path';
import glob from 'glob';
import minimatch from 'minimatch';
import * as pkg from './package.json';

let log = debug('wilu');


function isObject(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Object.prototype);
}

function isSet(value) {
	return Object.prototype.toString.call(value) === Object.prototype.toString.call(Set.prototype);
}

function reduceObjects(parent, child, iterating = false) {
	try {
		for(let property in parent) {
			if(Array.isArray(parent[property]))
				parent[property] = new Set(parent[property]);

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
			target.sources = target.sources || {};
			let src = target.sources;
			src.extensions = src.extensions || {c: new Set(['c']), 'c++': new Set(['cc', 'cpp']), asm: new Set(['s', 'S'])};

			if(src.path === undefined)
				src.path = 'src';

			if(src.subpath) {
				src.path = path.join(src.path, src.subpath);
				delete src.subpath;
			}

			if(isSet(src.include) && src.path !== null) {
				for(let exclude of src.exclude) {
					src.include.delete(exclude);
				}

				src.include = await Promise.all([...src.include].map((pattern) => aglob(pattern, {cwd: src.path, matchBase: true})));
				src.include = src.include.reduce((all, current) => [...all, ...current]);

				for(let exclude of src.exclude)
					src.include = src.include.filter((include) => !minimatch(include, exclude, {matchBase: true}));

				src.include = src.include.map((include) => path.join(src.path, include));
				src.include = [...new Set(src.include)];
				src.path = null;

				for(let type in src.extensions) {
					src.extensions[type] = new Set([...src.extensions[type]]
												   .map((ext) => minimatch.match(src.include, '*.' + ext, {matchBase: true}))
												   .reduce((a, b) => [...a, ...b]));

												   if(src.extensions[type].size === 0)
													   delete src.extensions[type];
				}
			}

			target.sources = src.extensions;
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

async function makefile(info) {
	try {
		if(!pkg.build)
			return;

		targets(pkg);
		await sources(pkg);

		let out = [];
		let outdirs = new Set();

		for(let name in info.build) {
			let target = info.build[name];

			target.name = target.name || 'app';
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

			let compilers = target.compilers;
			let src = target.sources;

			outdirs.add(target.directory);
			target.objdirectory = path.join(target.directory, target.objdirectory);
			target.subdirectory = path.join(target.directory, target.subdirectory);

			if(target.toolset && target.toolset.length)
				target.toolset += '-';

			if(compilers.c === undefined)
				compilers.c = 'gcc';

			if(compilers['c++'] === undefined)
				compilers['c++'] = 'g++';

			if(compilers.asm === undefined)
				compilers.asm = 'gcc -x --assembler-with-cpp';

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

			for(let type in src) {
				let objects = suffix(src[type], '.o');
				let compiler = target.toolset + target.compilers[type];
				let linker = target.toolset + (target.sources['c++'] ? target.compilers['c++'] : target.compilers['c']);
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

				let builtObjects = prefix(objects, path.join(target.objdirectory, name) + path.sep);
				let dirs = [target.subdirectory, ...new Set(builtObjects.map((o) => path.dirname(o)))].join(' ');

				let mkdirs = [dirs + ':\n\t@mkdir -p ' + dirs];

				let link = [
					name + ':',
					dirs,
					objects.join(' ') + '\n\t@' + linker,
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

				out.push(mkdirs, compile, link);
			}
		}

		out.push('clean:\n\t-@rm -rf ' + [...outdirs].join(' '));

		return out.join('\n\n') + '\n';
	} catch(e) {
		throw e;
	}
}

export default makefile;

(async function () {
	try {
		//log(await makefile(pkg));
	} catch(e) {
		console.error(e.stack);
		throw e;
	}
})()
