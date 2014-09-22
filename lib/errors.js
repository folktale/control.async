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
 * Handles errors thrown in a future computation.
 *
 * @module async/errors
 */


// -- Dependencies -----------------------------------------------------
var curry  = require('core.lambda').curry


// -- Implementation ---------------------------------------------------
module.exports = function(Future) {
  var exports = {}

  /**
   * Reifies some errors thrown by the computation to a rejected future.
   *
   * Ideally you wouldn't care about reifying errors thrown by synchronous
   * computations, but this might come in handy for some lifted computations.
   *
   * @method
   * @summary (γ → Boolean) → Future[α, β] (:throws γ) → Future[α|γ, β]
   */
  exports.catchOnly = curry(2, catchOnly)
  function catchOnly(filter, future) { return new Future(function(reject, resolve) {
    try {
      future.fork(reject, resolve)
    } catch(error) {
      if (filter(error))  reject(error)
      else                throw error
    }
  }, future.cleanup)}
  
  
  /**
   * Reifies errors thrown by the computation to a rejected future.
   *
   * **Special care should be taken when using this method, since it'll reify
   * *ALL* errors (for example, OutOfMemory errors, StackOverflow errors, ...),
   * and it can potentially lead the whole system to a unstable state.** The
   * `catch` method is favoured, as you can decide which errors should be caught
   * by this method, and all the others will crash the process as expected.
   *
   * Ideally you wouldn't care about reifying errors thrown by synchronous
   * computations, but this might come in handy for some lifted computations.
   *
   * @method
   * @summary Future[α, β] (:throws γ) → Future[α|γ, β]
   */
  exports.catchAllPossibleErrors = catchAll
  function catchAll(future){ return new Future(function(reject, resolve) {
    try {
      future.fork(reject, resolve)
    } catch(error) {
      reject(error)
    }
  }, future.cleanup)}


  return exports
}