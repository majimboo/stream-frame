'use strict';

var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

var StreamFrame = require('../');
var buffer = new Buffer('0C00526263242306523423230C0052626324230652342324', 'hex');

// add tests
suite

.add('StreamFrame', function () {
  var stream = new StreamFrame();
  stream.handleData(buffer);
})

// add listeners
.on('cycle', function (event) {
  console.log(String(event.target));
})
.on('complete', function () {
})
// run async
.run({ async: true });
