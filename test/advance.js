'use strict';

var should = require('should');
var net    = require('net');
var StreamFrame = require('../');

var bigBuf = new Buffer(2000);
bigBuf.writeUInt16LE(2000, 0);
bigBuf.writeUInt16LE(10, 1998);

describe('StreamFrame', function () {
  var server, client, B;

  describe('#BigBuffer', function () {
    beforeEach(function () {
      B = new StreamFrame();
      server = net.createServer();
      server.listen(9797);
      client = new net.Socket();
      client.connect(9797);
    });

    afterEach(function () {
      server.close();
      client.end();
      client.destroy();
    });

    it('should frame each message properly', function (done) {
      B.set('lengthSize', 2);

      // server
      server.on('connection', function (socket) {
        var rcv = 0;

        B.wrap(socket);
        B.on('data', function (msg) {
          if (rcv >= 9) return done();
          msg.length.should.equal(2000);
          msg.readUInt16LE(1998).should.equal(10);
          rcv++;
        });
      });

      // client
      client.write(Buffer.concat([ bigBuf, bigBuf, bigBuf, bigBuf, bigBuf, bigBuf, bigBuf, bigBuf, bigBuf, bigBuf ]));
    });

    it('should accept 1 lengthSize', function (done) {
      B.set('lengthSize', 1);

      // server
      server.on('connection', function (socket) {
        B.wrap(socket);
        B.on('data', function (msg) {
          msg.length.should.equal(12);
          done();
        });
      });

      // client
      client.write(new Buffer('0C0052626324230652342323', 'hex'));
    });

    it('should accept 2 lengthSize', function (done) {
      B.set('lengthSize', 2);

      // server
      server.on('connection', function (socket) {
        B.wrap(socket);
        B.on('data', function (msg) {
          msg.length.should.equal(12);
          done();
        });
      });

      // client
      client.write(new Buffer('0C0052626324230652342323', 'hex'));
    });

    it('should accept 4 lengthSize', function (done) {
      B.set('lengthSize', 4);

      // server
      server.on('connection', function (socket) {
        B.wrap(socket);
        B.on('data', function (msg) {
          msg.length.should.equal(11);
          done();
        });
      });

      // client
      client.write(new Buffer('0B00000063242306523423', 'hex'));
    });

  });

});
