import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, db, isAdmin } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import Login from "./components/Login";
import SellerDashboard from "./components/SellerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import DisclaimerPopup from "./components/DisclaimerPopup";
import SellerRegistration from "./components/SellerRegistration";
import AdminNotifications from "./components/AdminNotifications";
import ProductUploadRequest from "./components/ProductUploadRequest";

function App() {
  console.log("App component rendering");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    console.log("App useEffect running");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user);
      if (user) {
        setUser(user);
        // Check if user is admin
        if (isAdmin(user.email)) {
          setUserRole('admin');
          // Ensure admin role is set in Firestore
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, { role: 'admin', email: user.email }, { merge: true });
        } else {
          // Check if user is a seller
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setUserRole('user');
            // Set default user role in Firestore
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, { role: 'user', email: user.email }, { merge: true });
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    console.log("App is loading");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9900]"></div>
      </div>
    );
  }

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true);
  };

  console.log("App rendering main content");
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {!disclaimerAccepted && <DisclaimerPopup onAccept={handleDisclaimerAccept} />}
        {disclaimerAccepted && (
          <>
            <Navbar user={user} userRole={userRole} />
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Hero />
                    <ProductGrid />
                  </>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/seller-registration"
                element={
                  user ? (
                    userRole === 'seller' ? (
                      <Navigate to="/seller-dashboard" replace />
                    ) : (
                      <SellerRegistration />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/product-upload-request"
                element={
                  user && userRole === 'seller' ? (
                    <ProductUploadRequest />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/seller-dashboard"
                element={
                  user && userRole === 'seller' ? (
                    <SellerDashboard />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  user && isAdmin(user.email) ? (
                    <AdminDashboard />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/admin-notifications"
                element={
                  user && userRole === 'admin' ? (
                    <AdminNotifications />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
