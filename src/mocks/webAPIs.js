const util = require('util');
const { Readable } = require('stream');

// TextEncoder/TextDecoder polyfill
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

// ReadableStream polyfill
class ReadableStreamPolyfill {
  constructor(options) {
    this._readable = new Readable(options);
  }
}
global.ReadableStream = ReadableStreamPolyfill;

// Web Streams API
global.WritableStream = class WritableStream {};
global.TransformStream = class TransformStream {};
global.ByteLengthQueuingStrategy = class ByteLengthQueuingStrategy {};
global.CountQueuingStrategy = class CountQueuingStrategy {};

// Blob polyfill (might be needed)
global.Blob = class Blob {};

// Web Crypto API (might be needed)
global.crypto = global.crypto || {
  getRandomValues: function(buffer) {
    return require('crypto').randomFillSync(buffer);
  }
};
