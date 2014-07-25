var should = require('chai').should();
var B = require('../');
var net = require('net');

describe('#basic', function() {
  var server, client;

  beforeEach(function() {
    server = net.createServer();
    server.listen(8124);
    client = new net.Socket();
    client.connect(8124);
  });

  afterEach(function() {
    server.close();
  });

  it('should frame each message properly', function(done) {
    B.set('lengthSize', 2);

    // server
    server.addListener('connection', function(socket) {
      socket.pipe(B);

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

});
