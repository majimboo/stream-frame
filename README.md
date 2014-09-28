StreamFrame [![Build Status](https://travis-ci.org/majimboo/stream-frame.svg?branch=master)](https://travis-ci.org/majimboo/stream-frame)
====

[![NPM](https://nodei.co/npm/stream-frame.png?downloads=true)](https://nodei.co/npm/stream-frame/)

StreamFrame is a stream framing library for node.js.

Install
-------

    npm install stream-frame --save

Installing the latest version

    $ npm install git+https://github.com/majimboo/stream-frame.git

Usage
-----

    var StreamFrame = require('stream-frame');

    var server = net.createServer(function (socket) {
      var B = new StreamFrame();
      B.wrap(socket);

      B.on('data', function(data) {
        console.log(data);
      });
    });

You can also pass the socket as a parameter of `StreamFrame()`.

    var B = new StreamFrame(socket);
    B.on('data', data_handler);

Options
-------

* lengthSize (default: 2)     - The length in bytes of the prepended message size.
* bigEndian  (default: false) - The byte order of the prepended length.

```
var StreamFrame = require('stream-frame');
var B = new StreamFrame();

B.set('lengthSize', 1); // uint8
B.set('lengthSize', 2); // uint16
B.set('lengthSize', 4); // uint32

B.set('bigEndian', true);  // uses bigEndian order
B.set('bigEndian', false); // uses default little endian order
```

Benchmark
---------

    v 0.0.3
    StreamFrame x 623,238 ops/sec ±1.72% (87 runs sampled)

    v 0.0.4
    StreamFrame x 886,578 ops/sec ±0.56% (90 runs sampled)

