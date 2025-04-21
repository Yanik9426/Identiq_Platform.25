const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn(); // Return unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  signOut: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } }))
};

const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: () => ({}), exists: true })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve())
    }))
  }))
};

const mockStorage = {
  ref: jest.fn(() => ({
    put: jest.fn(() => Promise.resolve()),
    getDownloadURL: jest.fn(() => Promise.resolve("https://example.com/image.jpg"))
  }))
};

export const getAuth = jest.fn(() => mockAuth);
export const getFirestore = jest.fn(() => mockFirestore);
export const getStorage = jest.fn(() => mockStorage);
export const initializeApp = jest.fn();
