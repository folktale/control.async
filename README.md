control.async
=============

[![Build Status](https://secure.travis-ci.org/folktale/control.async.png?branch=master)](https://travis-ci.org/folktale/control.async)
[![NPM version](https://badge.fury.io/js/control.async.png)](http://badge.fury.io/js/control.async)
[![Dependencies Status](https://david-dm.org/folktale/control.async.png)](https://david-dm.org/folktale/control.async)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)


Operations for asynchronous control flow.


## Example

```js
var fs    = require('fs')
var async = require('control.async')

var read = async.liftNode(fs.readFile)

var files = async.parallel( read('foo.txt', 'utf-8')
                          , read('bar.txt', 'utf-8')
                          , read('baz.txt', 'utf-8'))

var concatenated = files.chain(function(xs){ return xs.join('') })

// Futures are pure, so you need to actually run the action to get
// the effects.
concatenated.fork(
  function(error){ throw error }
, function(value){ console.log(value) }
)
```


## Installing

The easiest way is to grab it from NPM. If you're running in a Browser
environment, you can use [Browserify][]

    $ npm install control.async


### Using with CommonJS

If you're not using NPM, [Download the latest release][release], and require
the `control.async.umd.js` file:

```js
var Async = require('control.async')
```


### Using with AMD

[Download the latest release][release], and require the `control.async.umd.js`
file:

```js
require(['control.async'], function(Async) {
  ( ... )
})
```


### Using without modules

[Download the latest release][release], and load the `control.async.umd.js`
file. The properties are exposed in the global `Async` object:

```html
<script src="/path/to/control.async.umd.js"></script>
```


### Compiling from source

If you want to compile this library from the source, you'll need [Git][],
[Make][], [Node.js][], and run the following commands:

    $ git clone git://github.com/folktale/control.async.git
    $ cd control.async
    $ npm install
    $ make bundle
    
This will generate the `dist/control.async.umd.js` file, which you can load in
any JavaScript environment.

    
## Documentation

You can [read the documentation online][docs] or build it yourself:

    $ git clone git://github.com/folktale/control.async.git
    $ cd control.async
    $ npm install
    $ make documentation

Then open the file `docs/index.html` in your browser.


## Platform support

This library assumes an ES5 environment, but can be easily supported in ES3
platforms by the use of shims. Just include [es5-shim][] :)


## Licence

Copyright (c) 2013-2014 Quildreen Motta.

Released under the [MIT licence](https://github.com/folktale/control.async/blob/master/LICENCE).

<!-- links -->
[Fantasy Land]: https://github.com/fantasyland/fantasy-land
[Browserify]: http://browserify.org/
[release]: https://github.com/folktale/control.async/releases/download/v0.0.0/control.async-0.0.0.tar.gz
[Git]: http://git-scm.com/
[Make]: http://www.gnu.org/software/make/
[Node.js]: http://nodejs.org/
[es5-shim]: https://github.com/kriskowal/es5-shim
[docs]: http://folktale.github.io/control.async
