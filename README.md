Wilu
===

Wilu generates makefiles without additional dependencies.

Features
===
* Import native code from npm as if they were node.js modules
* Build instructions in package.json
* Incremental build instructions

Generate the makefile
===
make.js:
```js
import wilu from 'wilu';
import * as pkg from './package.json';

(async function () {
	try {
		pkg.build.name = pkg.name;
		pkg.build.version = pkg.version;
		await wilu(pkg.build);
	} catch(e) {
		throw e;
	}
})();
```

```sh
npm i --save-dev wilu
babel-node make.js
```

Now you have `makefile` in your current directory.

Build instructions
===
Goes to package.json under `build` as an object. See the package.json of this project.

The build targets are defined in `build` under property `+` as an object where the key is the target name and the value is an object
that has all the same rules the `build` has in package.json.

Each target in `+` will inherit the properties of the parent merging with its own properties.
The build targets can define more targets under their property `+`.

Example package.json
---
```json
{
	"name": "app",
	"version": "0.0.1",
	"build": {
		"sources": {
			"include": ["*.c"]
		},
		"options": {
			"compiler": {
				"all": ["Wall"],
				"c": ["std=c11", "Wstrict-prototypes"]
			}
		}
		"+": {
			"release": {
				"options": {
					"compiler": {
						"all": ["O3"]
					}
				}
			},
			"debug": {
				"options": {
					"compiler": {
						"all": ["O0", "ggdb"]
					}
				}
			}
		}
	}
}
```

This results to the below structure when using the above make.js.
The result is used later to generate the makefile.
The make targets are `release` and `debug`.

```json
{
	"release": {
		"name": "app",
		"version": "0.0.1",
		"sources": {
			"include": ["*.c"]
		},
		"options": {
			"compiler": {
				"all": ["Wall", "O3"],
				"c": ["std=c11", "Wstrict-prototypes"]
			}
		}
	},
	"debug": {
		"name": "app",
		"version": "0.0.1",
		"sources": {
			"include": ["*.c"]
		},
		"options": {
			"compiler": {
				"all": ["Wall", "O0", "ggdb"],
				"c": ["std=c11", "Wstrict-prototypes"]
			}
		}
	}
}
```

Properties
---

* name: defines the output name
* version: defines the version
* sources
  - include: array of glob rules
  - exclude: array of glob rules
  - path: path to the base of source files, the above rules are based on this. Defaults to 'src'.
  - subpath: added to path before finding sources
* options
  - compiler
    - all: array of flags for all targets
    - c: array of flags for c language targets
    - c++: array of flags for c++ language targets
    - asm: array of flags for assembler language targets
  - linker: array of flags for the linker
  - assembler: array of flags for the assembler
* machine: array of machine flags
* definitions: array of defines
* search
  - includes: array of paths for includes
  - libraries: array of paths for libraries
  - scripts: array of paths for linker scritps
* libraries
  - static: array of static link libraries
  - shared: array of shared link libraries
* directories
  - base: output directory. Defaults to 'build'.
  - output: subdirectory in base. Defaults to 'bin'.
  - objects: subdirectory for the objects. Defaults to 'obj'.
* import: array of modules to be imported with targets prefixed with the module name and an underscore
* depends: array of targets to build before linking
* merge: array of targets to inherit properties from. Same as adding under `+` property, but can be used to interlink targets or
  continue an imported target.
* library: a boolean, which turns the target into a static library. The output name is changed into 'libname.a'
* shared: a boolean, which turns a library target into a shared library. The output name is changed into 'libname.so.version'
  and symbolic links will be generated.
* variables: object of variables where the keys are the variable names. Each property is turned into 'key= value'. This allows to
  specify a modifier to the equal sign, e.g. ':' or '?'.
* commands: array of commands to be executed after linking
