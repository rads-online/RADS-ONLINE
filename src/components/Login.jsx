import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerDetails, setSellerDetails] = useState({
    brandName: "",
    businessType: "",
    website: "",
    phone: "",
    address: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        const userData = {
          email: user.email,
          role: isSeller ? "seller" : "user",
          createdAt: new Date().toISOString(),
          lastSignIn: new Date().toISOString()
        };

        if (isSeller) {
          // Add seller-specific details
          Object.assign(userData, {
            sellerStatus: "pending",
            sellerDetails: sellerDetails
          });
        }

        await setDoc(doc(db, "users", user.uid), userData);
        navigate("/"); // Navigate to home after successful registration
      } else {
        // Login existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update last sign in
        await setDoc(doc(db, "users", user.uid), {
          lastSignIn: new Date().toISOString()
        }, { merge: true });
        
        navigate("/"); // Navigate to home after successful login
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError(error.message);
    }
  };

  const handleSellerDetailsChange = (e) => {
    const { name, value } = e.target;
    setSellerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegistering && (
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSeller"
                  checked={isSeller}
                  onChange={(e) => setIsSeller(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isSeller" className="text-gray-700 text-sm font-bold">
                  Register as a Seller
                </label>
              </div>

              {isSeller && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      name="brandName"
                      placeholder="Enter your brand name"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sellerDetails.brandName}
                      onChange={handleSellerDetailsChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Business Type
                    </label>
                    <input
                      type="text"
                      name="businessType"
                      placeholder="e.g., Retail, Wholesale, Manufacturer"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sellerDetails.businessType}
                      onChange={handleSellerDetailsChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      placeholder="Enter your website URL"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sellerDetails.website}
                      onChange={handleSellerDetailsChange}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sellerDetails.phone}
                      onChange={handleSellerDetailsChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Business Address
                    </label>
                    <textarea
                      name="address"
                      placeholder="Enter your business address"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sellerDetails.address}
                      onChange={handleSellerDetailsChange}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {!isRegistering && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot Password?
              </button>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition-colors"
          >
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setIsSeller(false);
              setSellerDetails({
                brandName: "",
                businessType: "",
                website: "",
                phone: "",
                address: ""
              });
            }}
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
} 