import { initializeApp, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
  authDomain: "rads-online.firebaseapp.com",
  projectId: "rads-online",
  storageBucket: "rads-online.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // If app is already initialized, get the existing app
  app = getApp();
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Admin email list
export const ADMIN_EMAILS = [
  'sudharshanr2510@gmail.com',
  'r983230@gmail.com',
  'contactradsonline@gmail.com'
];

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  CUSTOMER: 'customer'
};

// Check if user is admin
export const isAdmin = (email) => {
  return ADMIN_EMAILS.includes(email);
};

// Check if user is seller
export const isSeller = (role) => {
  return role === USER_ROLES.SELLER;
};

// Check if user is customer
export const isCustomer = (role) => {
  return role === USER_ROLES.CUSTOMER;
};

// Initialize admin accounts
export const initializeAdminAccounts = async () => {
  const { doc, setDoc, getDoc } = await import('firebase/firestore');
  
  for (const email of ADMIN_EMAILS) {
    try {
      const adminDoc = doc(db, 'users', email);
      const adminSnapshot = await getDoc(adminDoc);
      
      if (!adminSnapshot.exists()) {
        await setDoc(adminDoc, {
          email,
          role: USER_ROLES.ADMIN,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        console.log(`Admin account initialized for ${email}`);
      }
    } catch (error) {
      console.error(`Error initializing admin account for ${email}:`, error);
    }
  }
};

// Error handling for Firebase operations
export const handleFirebaseError = (error) => {
  console.error('Firebase error:', error);
  
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please login instead.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
};
