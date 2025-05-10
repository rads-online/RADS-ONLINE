import React, { useState, useEffect } from 'react';

const DisclaimerPopup = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
    // Store acceptance in localStorage
    localStorage.setItem('disclaimerAccepted', 'true');
  };

  // Check if disclaimer was already accepted
  useEffect(() => {
    const accepted = localStorage.getItem('disclaimerAccepted');
    if (accepted === 'true') {
      setIsVisible(false);
      onAccept();
    }
  }, [onAccept]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Important Notice</h2>
        <div className="text-gray-600 mb-6">
          <p className="mb-4">
            Welcome to RADS Online. Please read this important notice:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>RADS Online is a platform for connecting buyers and sellers.</li>
            <li>We do not own, sell, or take responsibility for any products listed on this platform.</li>
            <li>All products are owned and sold by their respective sellers.</li>
            <li>Product owners are solely responsible for their listings and transactions.</li>
            <li>By accepting this notice, you acknowledge and agree to these terms.</li>
          </ul>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleAccept}
            className="bg-[#FF9900] text-white px-6 py-2 rounded-md hover:bg-[#E68A00] transition-colors"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPopup; 