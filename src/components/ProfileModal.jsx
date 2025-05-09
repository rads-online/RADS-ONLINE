import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function ProfileModal({ onClose }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        email: currentUser.email,
        uid: currentUser.uid,
        lastSignIn: currentUser.metadata.lastSignInTime,
        role: currentUser.email.includes("admin") ? "admin" : "user"
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      navigate("/login");
      onClose();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg w-96 shadow-xl">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Profile Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <p className="text-gray-600 bg-gray-50 p-2 rounded">{user.email}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Account Type</label>
              <p className="text-gray-600 bg-gray-50 p-2 rounded capitalize">{user.role}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Last Sign In</label>
              <p className="text-gray-600 bg-gray-50 p-2 rounded">
                {new Date(user.lastSignIn).toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors mt-4"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 