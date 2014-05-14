// Copyright (c) 2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * Core operations for asynchronous control flow.
 *
 * @module async/core
 */

// -- Dependencies -----------------------------------------------------
var Future = require('data.future')


// -- Implementation ---------------------------------------------------

/**
 * Returns an action that always fails with the given data.
 *
 * @method
 * @summary α → Future[α, β]
 */
exports.fail = fail
function fail(a) {
  return new Future(function(reject, resolve) { reject(a) })
}


/**
 * Resolves all futures in parallel, and collects all of their values.
 *
 * @method
 * @summary Array[Future[α, β]] → Future[α, Array[β]]
 */
exports.parallel = parallel
function parallel(xs) { return new Future(function(reject, resolve) {
  var len      = xs.length
  var result   = new Array(len)
  var resolved = false

  xs.forEach(runComputation)

  function runComputation(x, i) {
    return x.fork( function(e) {
                     if (resolved)  return
                     resolved = true
                     reject(e) }

                 , function(v) {
                     if (resolved)  return
                     result[i] = v
                     len       = len - 1
                     if (len === 0) { resolved = true
                                      resolve(result) }})}
})}


/**
 * Returns the value of the first resolved or rejected future.
 *
 * @method
 * @summary Array[Future[α, β]] → Future[α, β]
 */
exports.nondeterministicChoice = nondeterministicChoice
function nondeterministicChoice(xs){ return new Future(function(reject, resolve) {
  var resolved = false
  xs.forEach(function(x){ x.fork( function(e){ transition(reject, e) }
                                , function(v){ transition(resolve, v) }) })

  function transition(f, a) {
    if (!resolved) { resolved = true
                     f(a) }}
})}