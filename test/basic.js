'use strict';

var should = require('should');
var net = require('net');
var StreamFrame = require('../');

describe('StreamFrame', function () {
  var server, client, B;

  describe('#littleEndian', function () {
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

      var index = 0;

      function getData() {
        var datas = [
          '0c0052626324230652342323',
          '0c0052626324230652342324'
        ]

        if (index > 1) index = 0;
        return datas[index++];
      }

      // server
      server.on('connection', function (socket) {
        var rcv = 0;

        B.wrap(socket);
        B.on('data', function (msg) {
          if (rcv >= 9) return done();
          msg.length.should.equal(12);
          msg.toString('hex').should.equal(getData());
          rcv++;
        });
      });

      // client
      for (var i = 0; i < 10; i++) {
        client.write(new Buffer(getData(), 'hex'));
      }
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
      client.write(new Buffer('0CFF52626324230652342323', 'hex'));
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

  describe('#bigEndian', function () {
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
      B.set('bigEndian', true);

      var index = 0;

      function getData() {
        var datas = [
          '000c52626324230652342323',
          '000c52626324230652342324'
        ]

        if (index > 1) index = 0;
        return datas[index++];
      }

      // server
      server.on('connection', function (socket) {
        var rcv = 0;

        B.wrap(socket);
        B.on('data', function (msg) {
          if (rcv >= 9) return done();
          msg.length.should.equal(12);
          msg.toString('hex').should.equal(getData());
          rcv++;
        });
      });

      // client
      for (var i = 0; i < 10; i++) {
        client.write(new Buffer(getData(), 'hex'));
      }
    });

    it('should accept 1 lengthSize', function (done) {
      B.set('lengthSize', 1);
      B.set('bigEndian', true);

      // server
      server.on('connection', function (socket) {
        B.wrap(socket);
        B.on('data', function (msg) {
          msg.length.should.equal(12);
          done();
        });
      });

      // client
      client.write(new Buffer('0CFF52626324230652342323', 'hex'));
    });

    it('should accept 2 lengthSize', function (done) {
      B.set('lengthSize', 2);
      B.set('bigEndian', true);

      // server
      server.on('connection', function (socket) {
        B.wrap(socket);
        B.on('data', function (msg) {
          msg.length.should.equal(12);
          done();
        });
      });

      // client
      client.write(new Buffer('000C52626324230652342323', 'hex'));
    });

    it('should accept 4 lengthSize', function (done) {
      B.set('lengthSize', 4);
      B.set('bigEndian', true);

      // server
      server.on('connection', function (socket) {
        B.wrap(socket);
        B.on('data', function (msg) {
          msg.length.should.equal(11);
          done();
        });
      });

      // client
      client.write(new Buffer('0000000B63242306523423', 'hex'));
    });
  });

});
