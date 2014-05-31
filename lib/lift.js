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
 * Converts functions written for continuation-passing style to fuctions that
 * work on Futures.
 *
 * @module async/lift
 */

// -- Dependencies -----------------------------------------------------
var Future = require('data.future')


// -- Aliases ----------------------------------------------------------
var toArray = Function.call.bind([].slice)


// -- Implementation ---------------------------------------------------

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
    return new Future(function _lift$Future(_, resolve) {
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
    return new Future(function _liftNode$Future(_, resolve) {
                        f.apply(null, args.concat([resolve])) })}
}
