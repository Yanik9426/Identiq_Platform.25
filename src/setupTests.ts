// src/setupTests.ts
// Import the web API polyfills first
import './webAPIs.js';

// Now safe to import testing libraries
import '@testing-library/jest-dom';

// Create a comprehensive mock for all Firebase modules
const mockAuth = {
  currentUser: null
};

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
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
  updateProfile: jest.fn(() => Promise.resolve())
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: () => ({}), exists: true })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve())
    }))
  })),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({}) })),
  setDoc: jest.fn(),
  updateDoc: jest.fn()
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(() => ({
    put: jest.fn(() => Promise.resolve()),
    getDownloadURL: jest.fn(() => Promise.resolve("https://example.com/image.jpg"))
  }))
}));

// Any other setup code here