# # control.async

/** ^
 * Copyright (c) 2013-2014 Quildreen Motta
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

# Operations for asynchronous control flow.

Future = require 'data.future'
flaw   = require 'flaw'

TimeoutError = (n) -> flaw 'TimeoutError', "Timeoutted after #n milliseconds."


# # Function: delay
#
# Returns a promise that gets resolved after X milliseconds
#  
# + type: Int -> Future(a, Int)
export delay = (n) -> new Future (reject, resolve) !->
  s = new Date
  set-timeout (-> resolve (new Date - s)), n


# # Function: timeout
#
# Returns a promise that fails after X milliseconds
#
# + type: Int -> Future(Error, a)
export timeout = (n) -> new Future (reject, resolve) !->
  s = new Date
  set-timeout (-> reject (TimeoutError n)), n


# # Function: parallel
#
# Resolves all futures in parallel.
#
# + type: [Future(a, b)] -> Future(a, [b])
export parallel = (xs) -> new Future (reject, resolve) !->
  len      = xs.length
  result   = new Array len
  resolved = false

  for x,i in xs => compute x, i

  function compute(x, i) => x.fork do
                                   * (e) -> do
                                            if resolved => return
                                            resolved := true
                                            reject e
                                   * (v) -> do
                                            if resolved => return
                                            result[i] := v
                                            len       := len - 1
                                            if len is 0 => do
                                                           resolved := true
                                                           resolve result

  
# # Function: nondeterministic-choice
#
# Returns the value of the first resolved or rejected future.
#
# + type: [Future(a, b)] -> Future(a, b)
export nondeterministic-choice = (xs) -> new Future (reject, resolve) !->
  resolved = false
  for x,i in xs => x.fork do
                          * (e) -> transition reject, e
                          * (v) -> transition resolve, v

  function transition(f, a) => if not resolved
    resolved := true
    f a
