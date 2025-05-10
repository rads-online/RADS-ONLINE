import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
  authDomain: "rads-online.firebaseapp.com",
  projectId: "rads-online",
  storageBucket: "rads-online.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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
  const { doc, setDoc } = await import('firebase/firestore');
  
  for (const email of ADMIN_EMAILS) {
    try {
      const adminDoc = doc(db, 'users', email);
      await setDoc(adminDoc, {
        email,
        role: USER_ROLES.ADMIN,
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error(`Error initializing admin account for ${email}:`, error);
    }
  }
};
