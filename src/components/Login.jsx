import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isAdmin, USER_ROLES } from '../firebase';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerDetails, setSellerDetails] = useState({
    brandName: '',
    businessType: '',
    website: '',
    phone: '',
    address: '',
    affiliateLink: ''
  });
  const navigate = useNavigate();

  const handleSellerDetailsChange = (e) => {
    const { name, value } = e.target;
    setSellerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is admin
      if (isAdmin(user.email)) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: USER_ROLES.ADMIN,
          lastLogin: new Date().toISOString()
        }, { merge: true });
        navigate('/admin-dashboard');
        return;
      }

      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === USER_ROLES.SELLER) {
          if (userData.status === 'pending') {
            setError('Your seller account is pending approval');
            return;
          }
          navigate('/seller-dashboard');
        } else {
          navigate('/');
        }
      } else {
        // Set default customer role
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: USER_ROLES.CUSTOMER,
          lastLogin: new Date().toISOString()
        }, { merge: true });
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Check if email is admin email
      if (isAdmin(email)) {
        setError('This email is reserved for admin accounts');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (isSeller) {
        // Create seller request
        await setDoc(doc(db, "sellerRequests", user.uid), {
          email: user.email,
          ...sellerDetails,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        // Set user role as seller (pending)
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: USER_ROLES.SELLER,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        setError('Your seller account request has been submitted. Please wait for admin approval.');
      } else {
        // Set user role as customer
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: USER_ROLES.CUSTOMER,
          createdAt: new Date().toISOString()
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError('Failed to register. Please try again.');
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
            {isRegistering ? 'Create an Account' : 'Sign in to your account'}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={isRegistering ? handleRegister : handleLogin}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#FF9900] focus:border-[#FF9900] focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#FF9900] focus:border-[#FF9900] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isRegistering && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#FF9900] focus:border-[#FF9900] focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {!isRegistering && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-[#FF9900] hover:text-[#FF8800]"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {isRegistering && (
            <div className="space-y-4">
              <div className="flex items-center">
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

              {isSeller && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label htmlFor="brandName" className="block text-sm font-medium text-gray-700">
                      Brand Name
                    </label>
                    <input
                      id="brandName"
                      name="brandName"
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF9900] focus:border-[#FF9900] sm:text-sm"
                      value={sellerDetails.brandName}
                      onChange={handleSellerDetailsChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                      Business Type
                    </label>
                    <input
                      id="businessType"
                      name="businessType"
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF9900] focus:border-[#FF9900] sm:text-sm"
                      value={sellerDetails.businessType}
                      onChange={handleSellerDetailsChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF9900] focus:border-[#FF9900] sm:text-sm"
                      value={sellerDetails.website}
                      onChange={handleSellerDetailsChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF9900] focus:border-[#FF9900] sm:text-sm"
                      value={sellerDetails.phone}
                      onChange={handleSellerDetailsChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Business Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF9900] focus:border-[#FF9900] sm:text-sm"
                      value={sellerDetails.address}
                      onChange={handleSellerDetailsChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="affiliateLink" className="block text-sm font-medium text-gray-700">
                      Affiliate Link
                    </label>
                    <input
                      id="affiliateLink"
                      name="affiliateLink"
                      type="url"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF9900] focus:border-[#FF9900] sm:text-sm"
                      value={sellerDetails.affiliateLink}
                      onChange={handleSellerDetailsChange}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF9900] hover:bg-[#FF8800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9900]"
            >
              {loading ? 'Processing...' : isRegistering ? 'Register' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setIsSeller(false);
                setSellerDetails({
                  brandName: '',
                  businessType: '',
                  website: '',
                  phone: '',
                  address: '',
                  affiliateLink: ''
                });
              }}
              className="font-medium text-[#FF9900] hover:text-[#FF8800]"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login; 