import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isAdmin, USER_ROLES, googleProvider } from '../firebase';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user is admin
      if (isAdmin(user.email)) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: USER_ROLES.ADMIN,
          lastLogin: new Date().toISOString()
        }, { merge: true });
        navigate('/admin-dashboard');
        return;
      }

      // Check if user exists
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // New user - create account based on checkbox
        if (isSeller) {
          // Create seller request
          await setDoc(doc(db, "sellerRequests", user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            status: 'pending',
            createdAt: new Date().toISOString()
          });

          // Set user role as seller (pending)
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: USER_ROLES.SELLER,
            status: 'pending',
            createdAt: new Date().toISOString()
          });

          setError('Your seller account request has been submitted. Please wait for admin approval.');
        } else {
          // Set user role as customer
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: USER_ROLES.CUSTOMER,
            createdAt: new Date().toISOString()
          });
          navigate('/');
        }
      } else {
        // Existing user - check role and status
        const userData = userDoc.data();
        if (userData.role === USER_ROLES.SELLER) {
          if (userData.status === 'pending') {
            setError('Your seller account is pending approval');
          } else {
            navigate('/seller-dashboard');
          }
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Multiple sign-in attempts detected. Please try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Rads Online
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Google account
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <input
              id="isSeller"
              name="isSeller"
              type="checkbox"
              checked={isSeller}
              onChange={(e) => setIsSeller(e.target.checked)}
              className="h-4 w-4 text-[#FF9900] focus:ring-[#FF9900] border-gray-300 rounded"
            />
            <label htmlFor="isSeller" className="ml-2 block text-sm text-gray-900">
              Register as a Seller
            </label>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF9900] hover:bg-[#FF8800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9900]"
          >
            {loading ? (
              'Processing...'
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Sign in with Google
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 