# 5to6
Move your project into the future.

### Usage

```
Usage: 5to6 [options] <file or dir ...>

Transform ES5 code on a file or directory into ES6 code.

Options:

-h, --help           output usage information
-V, --version        output the version number
-d, --out-dir [dir]  Directory for the output

```

###### File:

```
~/dev/5to6 (master) $ ./bin/5to6 test/fixture/amd.js
Writing /tmp/5to6/test/fixture/amd.js
Applied 2 transforms to 1 file(s) in 25 ms.
```

###### Files:

```
~/dev/5to6 (master) $ ./bin/5to6 test/*/*.js
Writing /tmp/5to6/test/fixture/amd.js
Writing /tmp/5to6/test/fixture/cjs.js
Applied 2 transforms to 2 file(s) in 26 ms.
```

###### Directory:

```
~/dev/5to6 (master) $ ./bin/5to6 test/
Writing /Users/jamuferguson/dev/5to6/test/5to6.js
Writing /Users/jamuferguson/dev/5to6/test/fixture/amd.js
Writing /Users/jamuferguson/dev/5to6/test/fixture/cjs.js
Applied 2 transforms to 3 file(s) in 29 ms.
```

### Todo

- [ ] Finish the CLI
- [x] AMD to CJS Modules
- [ ] AMD to ES6 Modules
- [ ] CJS to ES6 Modules
- [ ] IIFE to ES6 Modules
- [ ] Prototype to `Class`
- [ ] Functions to `=>`


### Ideas

Any suggestions and other ideas for transforms can be posted into our [ideas repo](https://github.com/5to6/ideas/issues).