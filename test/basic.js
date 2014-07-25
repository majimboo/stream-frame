var should = require('chai').should();
var expect = require('chai').expect;
var net = require('net');
var StreamFrame = require('../');

describe('#basic', function() {
  var server, client, B;

  beforeEach(function() {
    B = StreamFrame();
    server = net.createServer();
    server.listen(9797);
    client = new net.Socket();
    client.connect(9797);
  });

  afterEach(function() {
    server.close();
    client.end();
    client.destroy();
  });

  it('should frame each message properly', function(done) {
    B.set('lengthSize', 2);

    // server
    server.addListener('connection', function(socket) {
      B.wrap(socket);

      var rcv = 0;

      B.on('data', function(msg) {
        if (rcv === 9) return done();
        msg.length.should.equal(12);
        rcv++;
      });
    });

    // client
    for (var i = 0; i < 10; i++) {
      client.write(new Buffer('0C0052626324230652342323', 'hex'));
    }
  });

  it('should accept 1 lengthSize', function(done) {
    B.set('lengthSize', 1);

    // server
    server.addListener('connection', function(socket) {
      B.wrap(socket);
      B.on('data', function(msg) {
        msg.length.should.equal(12);
        done();
      });
    });

    // client
    client.write(new Buffer('0CFF52626324230652342323', 'hex'));
  });


  it('should accept 2 lengthSize', function(done) {
    B.set('lengthSize', 2);

    // server
    server.addListener('connection', function(socket) {
      B.wrap(socket);
      B.on('data', function(msg) {
        msg.length.should.equal(12);
        done();
      });
    });

    // client
    client.write(new Buffer('0C0052626324230652342323', 'hex'));
  });


  it('should accept 4 lengthSize', function(done) {
    B.set('lengthSize', 4);

    // server
    server.addListener('connection', function(socket) {
      B.wrap(socket);
      B.on('data', function(msg) {
        msg.length.should.equal(11);
        done();
      });
    });

    // client
    client.write(new Buffer('0B00000063242306523423', 'hex'));
  });

});
