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
var Maybe   = require('data.maybe')
var compose = require('core.lambda').compose; 

// -- Implementation ---------------------------------------------------
module.exports = function(Future) {
  var exports = {}

  /**
   * Memoises the result of a Future, for performance in pure Futures.
   *
   * @method
   * @summary Future[α, β] → Future[α, β]
   */
  exports.memoise = memoise
  function memoise(future) {
    // Possible states in this machine
    var IDLE     = 0
    var STARTED  = 1
    var RESOLVED = 2
    var REJECTED = 3
  
    // Mutable state
    var pending = []
    var value   = null
    var state   = IDLE
  
    // Applies the correct operations depending on the current state of this
    // machine. Basically, a machine has to be started (through a `.fork`), at
    // which point we collect all subsequent calls to `.fork` until one finishes,
    // we then invoke all pending operations with the result we've got and put
    // the machine in the correct resolution state (either REJECTED or RESOLVED).
    //
    // Subsequent calls to `.fork` will just be invoked right away with the
    // resolution value and the right function for the current state machine.
    return new Future(function(reject, resolve) {
                        switch (state) {
                          case IDLE:     return resolveFuture(reject, resolve)
                          case STARTED:  return addToPendingOperations(reject, resolve)
                          case RESOLVED: return resolve(value)
                          case REJECTED: return reject(value)
                          default:       throw new Error('Unknown state ' + state) }}
                     ,future.cleanup)
  
    // Remembers all operations that occurr between the time where the first
    // `.fork` is called and the time the first computation gets resolved, so we
    // can provide a value to all of them without running the computation twice.
    function addToPendingOperations(reject, resolve) {
      pending.push({ rejected: reject, resolved: resolve }) }
  
    // Resolves the future, places the machine in a resolved state, and invokes
    // all pending operations.
    function resolveFuture(reject, resolve) {
      state = STARTED
      return future.fork( function(error) { state = REJECTED
                                            value = error
                                            invokePending('rejected', error)
                                            return reject(error) }
  
                        , function(data)  { state = RESOLVED
                                            value = data
                                            invokePending('resolved', data)
                                            return resolve(data) })}
  
    // Invokes all pending operations.
    function invokePending(kind, data) {
      var xs = pending
      pending.length = 0
      for (var i = 0; i < xs.length; ++i)  xs[i][kind](value) }
  }
  
  
  /**
   * Resolves all futures in parallel, and collects all of their values.
   *
   * @method
   * @summary Array[Future[α, β]] → Future[α, Array[β]]
   */
  exports.parallel = parallel
  function parallel(xs) {
    function cleanupAll() {
      xs.forEach(function(x){ x.cleanup() }) }
  
    return new Future(function(reject, resolve) {
      var len      = xs.length
      var result   = new Array(len)
      var resolved = false

      if (xs.length === 0)  resolve([])
      else                  xs.forEach(runComputation)
    
      function runComputation(x, i) {
        return x.fork( function(e) {
                         if (resolved)  return
                         resolved = true
                         cleanupAll()
                         reject(e) }
    
                     , function(v) {
                         if (resolved)  return
                         result[i] = v
                         len       = len - 1
                         if (len === 0) { resolved = true
                                          cleanupAll()
                                          resolve(result) }})}
    }, cleanupAll)}
  
  
  /**
   * Returns the value of the first resolved or rejected future.
   *
   * @method
   * @summary Array[Future[α, β]] → Future[α, Maybe[β]]
   */
  exports.nondeterministicChoice = nondeterministicChoice
  function nondeterministicChoice(xs){
    function cleanupAll() {
      xs.forEach(function(x){ x.cleanup() }) }
  
    return new Future(function(reject, resolve) {
      var resolved = false

      if (xs.length === 0)
        resolve(Maybe.Nothing())
      else
        xs.forEach(function(x){ x.fork( function(e){ transition(reject, e) }
                                      , function(v){ transition(compose(resolve, Maybe.of), v) }) })
    
      function transition(f, a) {
        if (!resolved) { resolved = true
                         cleanupAll()
                         f(a) }}
    }, cleanupAll)}
  
  
  /**
   * Returns the value of the first resolved or rejected future.
   *
   * (An alias to `nondeterministicChoice`)
   *
   * @method
   * @summary Array[Future[α, β]] → Future[α, Maybe[β]]
   */
  exports.choice = nondeterministicChoice
  
  
  /**
   * Returns the value of the first resolved future, fails if all fails.
   *
   * @method
   * @summary Array[Future[α, β]] → Future[Array[α], Maybe[β]]
   */
  exports.tryAll = tryAll
  function tryAll(xs) {
    function cleanupAll() {
      xs.forEach(function(x){ x.cleanup() }) }
  
    return new Future(function(reject, resolve) {
      var resolved = false
      var pending  = xs.length
      var failures = new Array(pending)

      if (xs.length === 0)
        resolve(Maybe.Nothing())
      else
        xs.forEach(function(x, i){ x.fork( accumulateFailure(i)
                                         , function(v) { resolved = true
                                                         resolve(Maybe.of(v)) })})
    
      function accumulateFailure(index){ return function(error) {
        if (resolved)  return
    
        failures[index] = error
        pending = pending - 1
        if (pending === 0)  reject(failures) }}
    }, cleanupAll)}


  return exports
}