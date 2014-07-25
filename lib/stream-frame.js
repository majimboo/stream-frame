var util = require('util'),
  EventEmitter = require('events').EventEmitter;

/**
 * [StreamFrame description]
 */
var StreamFrame = function() {
  if (!(this instanceof StreamFrame)) return new StreamFrame();

  this.expectedSz = -1;
  this.receivedSz = 0;
  this.incomingPacket = [];
  this.settings = {};

  this.uint8 = 'readUInt8';
  this.uint16L = 'readUInt16LE';
  this.uint32L = 'readUInt32LE';
  this.uint16B = 'readUInt16BE';
  this.uint32B = 'readUInt32BE';
};

util.inherits(StreamFrame, EventEmitter);
module.exports = StreamFrame;

exports.uint8 = this.uint8;
exports.uint16L = this.uint16L;
exports.uint32L = this.uint32L;
exports.uint16B = this.uint16B;
exports.uint32B = this.uint32B;

StreamFrame.prototype.set = function(setting, value) {
  this.settings[setting] = value;
};

StreamFrame.prototype.get = function(setting) {
  return this.settings[setting];
};

/**
 * [wrap description]
 * @param  {[type]} socket [description]
 * @return {[type]}        [description]
 */
StreamFrame.prototype.wrap = function(socket) {
  this.socket = socket;
  this.socket.on('data', this.write.bind(this));
};

/**
 * [write description]
 * @param  {[type]} chunks [description]
 * @return {[type]}        [description]
 */
StreamFrame.prototype.write = function(chunks) {
  this.handleData(chunks);
};

/**
 * [handleData description]
 * @param  {[type]} buff [description]
 * @return {[type]}      [description]
 */
StreamFrame.prototype.handleData = function(buff) {
  var recurse = false;

  var endian = this.get('endianness') || 'little';
  var lenSz = this.get('lengthSize') || 'readUInt16LE';

  if (typeof lenSz === 'number') {
    switch (lenSz) {
      case 1:
        lenSz = this.uint8;
        break;
      case 2:
        lenSz = this.uint16L;
        break;
      case 4:
        lenSz = this.uint32L;
        break;
      default:
        throw Error('unsupported size');
    }
  }

  if (this.expectedSz < 0) {
    // should be a customizable size
    this.expectedSz = buff[lenSz](0);
  }

  var expectedRemaining = this.expectedSz - this.receivedSz;

  if (buff.length > expectedRemaining) {
    var newBuff = buff.slice(0, expectedRemaining);
    buff = buff.slice(expectedRemaining);
    recurse = true;
    this.incomingPacket.push(newBuff);
    this.receivedSz = this.expectedSz;
  } else {
    this.incomingPacket.push(buff);
    this.receivedSz += buff.length;
  }

  if (this.receivedSz == this.expectedSz) {
    var payload = Buffer.concat(this.incomingPacket);

    this.emit('data', payload);

    this.reset();
  }

  if (recurse)
    this.handleData(buff);
};

/**
 * [reset description]
 * @return {[type]} [description]
 */
StreamFrame.prototype.reset = function() {
  this.expectedSz = -1;
  this.receivedSz = 0;
  this.incomingPacket = [];
};
