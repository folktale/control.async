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
 * Asynchronous actions related to time.
 *
 * @module async/time
 */

// -- Dependencies -----------------------------------------------------
var flaw   = require('flaw')


// -- Helpers ----------------------------------------------------------

/**
 * Timeout, in ms.
 *
 * @private
 * @summary Number → Error
 */
function TimeoutError(n) {
  return flaw( 'TimeoutError'
             , 'Timeoutted after ' + n + ' milliseconds.')
}

// -- Implementation ---------------------------------------------------
module.exports = function(Future) {
  var exports = {}

  /**
   * Returns a future that gets resolved after N milliseconds.
   *
   * The value of the future will be the delta of the time from its execution to
   * the resolution.
   *
   * @method
   * @summary Number → Future[α, Number]
   */
  exports.delay = delay
  function delay(n) {
    var timer;
    
    return new Future(function(reject, resolve) {
      var s = new Date
      timer = setTimeout( function(){ resolve(new Date - s) }
                        , n)
    }, function(){ clearTimeout(timer) })}
  
  
  /**
   * Returns a future that fails after N milliseconds.
   *
   * @method
   * @summary Number → Future[TimeoutError, α]
   */
  exports.timeout = timeout
  function timeout(n) {
    var timer;
    
    return new Future(function(reject, resolve) {
      var s = new Date
      setTimeout( function(){ reject(TimeoutError(n)) }
                , n)
    }, function(){ clearTimeout(timer) })}


  return exports
}