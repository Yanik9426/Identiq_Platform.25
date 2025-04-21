// Direct implementation of Web API polyfills
// TextEncoder/TextDecoder polyfill
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Minimal stream polyfills
if (typeof global.ReadableStream === 'undefined') {
  // @ts-ignore: Simplified implementation for testing
  global.ReadableStream = class ReadableStream {
    constructor() { this.locked = false; }
    locked = false;
    cancel() { return Promise.resolve(); }
    getReader() { return {}; }
    pipeThrough() { return new ReadableStream(); }
    pipeTo() { return Promise.resolve(); }
    tee() { return [new ReadableStream(), new ReadableStream()]; }
  };
}

if (typeof global.WritableStream === 'undefined') {
  // @ts-ignore: Simplified implementation for testing
  global.WritableStream = class WritableStream {
    constructor() { this.locked = false; }
    locked = false;
    abort() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
    getWriter() { return {}; }
  };
}

if (typeof global.TransformStream === 'undefined') {
  // @ts-ignore: Simplified implementation for testing
  global.TransformStream = class TransformStream {
    constructor() {
      this.readable = new global.ReadableStream();
      this.writable = new global.WritableStream();
    }
    readable = null as any;
    writable = null as any;
  };
}

if (typeof global.ByteLengthQueuingStrategy === 'undefined') {
  // @ts-ignore: Simplified implementation for testing
  global.ByteLengthQueuingStrategy = class ByteLengthQueuingStrategy {
    constructor(init: any) {
      this.highWaterMark = init?.highWaterMark || 1;
    }
    highWaterMark = 1;
    size() { return 1; }
  };
}

if (typeof global.CountQueuingStrategy === 'undefined') {
  // @ts-ignore: Simplified implementation for testing
  global.CountQueuingStrategy = class CountQueuingStrategy {
    constructor(init: any) {
      this.highWaterMark = init?.highWaterMark || 1;
    }
    highWaterMark = 1;
    size() { return 1; }
  };
}

// Blob polyfill
if (typeof global.Blob === 'undefined') {
  // @ts-ignore: Simplified implementation for testing
  global.Blob = class Blob {
    constructor() {
      this.size = 0;
      this.type = '';
    }
    size = 0;
    type = '';
    arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
    text() { return Promise.resolve(''); }
    slice() { return new Blob(); }
    stream() { return new ReadableStream(); }
  };
}

// Web Crypto API
if (typeof global.crypto === 'undefined' || !global.crypto.getRandomValues) {
  global.crypto = global.crypto || {};
  global.crypto.getRandomValues = function(buffer) {
    return require('crypto').randomFillSync(buffer);
  };
}

// Now safe to import testing libraries
import '@testing-library/jest-dom';

// Create a comprehensive mock for all Firebase modules
const mockAuth = {
  currentUser: null,
};

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn(); // Return unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(() => 
    Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })
  ),
  signOut: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })
  ),
  // Add any other auth methods your app uses
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  updateEmail: jest.fn(() => Promise.resolve()),
  updatePassword: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: () => ({}), exists: true })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
    })),
  })),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({}) })),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(() => ({
    put: jest.fn(() => Promise.resolve()),
    getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/image.jpg')),
  })),
}));

// Any other setup code here