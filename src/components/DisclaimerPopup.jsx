import React from 'react';

const DisclaimerPopup = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to RADS Online</h2>
        <div className="prose prose-sm text-gray-600 mb-6">
          <p className="mb-4">
            By accessing this website, you agree to the following terms and conditions:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>All products listed are from verified sellers and affiliate partners</li>
            <li>Product prices and availability are subject to change</li>
            <li>We verify all affiliate links before approval</li>
            <li>Your personal information will be handled according to our privacy policy</li>
            <li>We reserve the right to modify these terms at any time</li>
          </ul>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onAccept}
            className="bg-[#FF9900] text-white px-6 py-2 rounded-md hover:bg-[#FF8800] transition-colors"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPopup; 