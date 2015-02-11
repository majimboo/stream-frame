'use strict';

var util   = require('util');
var events = require('events');

/**
 * [StreamFrame description]
 */
function StreamFrame(socket) {
  if (!(this instanceof StreamFrame)) return new StreamFrame(socket);
  events.EventEmitter.call(this);

  this.inPacket   = [];
  this.expectedSz = -1;
  this.receivedSz = 0;
  this.settings   = {};

  if (socket) this.wrap(socket);
}

util.inherits(StreamFrame, events.EventEmitter);
module.exports = StreamFrame;

StreamFrame.prototype.set = function (setting, value) {
  this.settings[setting] = value;
};

StreamFrame.prototype.get = function (setting) {
  return this.settings[setting];
};

/**
 * [wrap description]
 * @param  {[type]} socket [description]
 * @return {[type]}        [description]
 */
StreamFrame.prototype.wrap = function (socket) {
  var self = this;
  socket.on('data', function (chunk) {
    self.handleData(chunk);
  });
};

/**
 * [handleData description]
 * @param  {[type]} buff [description]
 * @return {[type]}      [description]
 */
StreamFrame.prototype.handleData = function (buff) {
  var recurse = false;

  var lenSz  = this.get('lengthSize') || 2;
  var bigEnd = this.get('bigEndian');
  var offset = this.get('offset') || 0;
  var ignore = this.get('ignore');

  if (ignore) {
    this.emit('data', buff);
    return;
  }

  if (this.expectedSz < 0) {
    if (lenSz === 1)
      this.expectedSz = buff[0 + offset];
    else if (lenSz === 2 && !bigEnd)
      this.expectedSz = (buff[0 + offset] | (buff[1 + offset] << 8));
    else if (lenSz === 4 && !bigEnd)
      this.expectedSz = (buff[0 + offset] | (buff[1 + offset] << 8) | (buff[2 + offset] << 16) | (buff[3 + offset] << 24));
    else if (lenSz === 2 && bigEnd)
      this.expectedSz = ((buff[0 + offset] << 8) | buff[1 + offset]);
    else if (lenSz === 4 && bigEnd)
      this.expectedSz = ((buff[0 + offset] << 24) | (buff[1 + offset] << 16) | (buff[2 + offset] << 8) | buff[3 + offset]);
    else
      throw new Error('invalid length');
  }

  var expectedRemaining = (this.expectedSz - this.receivedSz);

  if (buff.length > expectedRemaining) {
    var tmp = buff.slice(0, expectedRemaining);
    buff = buff.slice(expectedRemaining);

    recurse = true;
    this.inPacket.push(tmp);
    this.receivedSz = this.expectedSz;
  } else {
    this.inPacket.push(buff);
    this.receivedSz += buff.length;
  }

  if (this.receivedSz === this.expectedSz) {
    this.emit('data', Buffer.concat( this.inPacket, this.expectedSz));
    this.reset();
  }

  if (recurse) this.handleData(buff);
};

/**
 * [reset description]
 * @return {[type]} [description]
 */
StreamFrame.prototype.reset = function () {
  this.inPacket   = [];
  this.expectedSz = -1;
  this.receivedSz = 0;
};
