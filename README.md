StreamFrame [![Build Status](https://travis-ci.org/majimboo/stream-frame.svg?branch=master)](https://travis-ci.org/majimboo/stream-frame)
====

StreamFrame is a stream framing library for node.js.

Installing
----

    npm install stream-frame --save

Usage
----

    var StreamFrame = require('stream-frame');
    var B = StreamFrame();

    var server = net.createServer(function(socket) {
      B.wrap(socket);

      B.on('data', function(msg) {
        // your framed msg is here
      });
    });

Configuration
----

* lengthSize (default: 2) - The length in bytes of the prepended message size.
* endianness (default: little) - The byte order of the prepended length.

----

    var StreamFrame = require('stream-frame');
    var B = StreamFrame();

    B.set('lengthSize', 1); // uint8
    B.set('lengthSize', 2); // uint16LE
    B.set('lengthSize', 4); // uint32LE

    B.set(B.uint8);   // uint8
    B.set(B.uint16L); // uint16LE
    B.set(B.uint32L); // uint32LE
    B.set(B.uint16B); // uint16BE
    B.set(B.uint32B); // uint32BE


TODO
----

- Support specified endianness
- More test
- Improve code
