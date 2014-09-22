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
 * Converts functions written for continuation-passing style, and similar
 * control structures (e.g.: Promises/A+) to fuctions that work on Futures.
 *
 * @module async/lift
 */

// -- Dependencies -----------------------------------------------------
var curry  = require('core.lambda').curry


// -- Aliases ----------------------------------------------------------
var toArray = Function.call.bind([].slice)


// -- Implementation ---------------------------------------------------
module.exports = function(Future) {
  var exports = {}

  /**
   * Converts a function that takes a simple continuation.
   *
   * @method
   * @summary (α₁, α₂, ..., αₙ, (β → Void)) → (α₁, α₂, ..., αₙ → Future[Void, β])
   */
  exports.lift = lift
  function lift(f) {
    return function _lift() {
      var args  = toArray(arguments)
      var _this = this
      return new Future(function(_, resolve) {
                          f.apply(null, args.concat([resolve])) })}
  }
  
  /**
   * Converts a function that takes a node-style continuation.
   *
   * @method
   * @summary (α₁, α₂, ..., αₙ, (β, γ → Void)) → (α₁, α₂, ..., αₙ → Future[β, γ])
   */
  exports.liftNode = liftNode
  function liftNode(f) {
    return function _liftNode() {
      var args  = toArray(arguments)
      var _this = this
      return new Future(function(reject, resolve) {
                          f.apply(null, args.concat([handle]))
  
                          function handle(err, data) {
                            if (err)  reject(err)
                            else      resolve(data) }})}
  }
  
  /**
   * Converts a Future to a node-style function.
   *
   * @method
   * @summary Future[α, β] → (α|null, β|null → Void)
   */
  exports.toNode = toNode
  function toNode(a) {
    return function(f) {
      a.fork( function(e){ f(e, null) }
            , function(v){ f(null, v) })
    }
  }
  
  /**
   * Converts a Promise/A+ to a Future.
   *
   * (Do note that it's impossible to give sensible types to Promises/A+, since
   * it badly breaks parametricity).
   *
   * @method
   * @summary Promise[MaybePromise[α], MaybePromise[β]] → Future[α, β]
   */
  exports.fromPromise = fromPromise
  function fromPromise(p) { return new Future(function(reject, resolve) {
    p.then(reject, resolve)
  })}
  
  /**
   * Converts from Future to Promise/A+.
   *
   * (Do note that nested futures are *NOT* flattened, just `join` it 'till you
   * get to the value itself, if you care about passing just the value)
   *
   * @method
   * @summary
   *   PromiseConstrutor → Future[α, β] → Promise[α, β]
   *   new PromiseConstructor(((α → Void), (β → Void) → Void)) → Promise[α, β]
   */
  exports.toPromise = curry(2, toPromise)
  function toPromise(Promise, a) { return new Promise(function(reject, resolve) {
    a.fork(reject, resolve)
  })}


  return exports
}