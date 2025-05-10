import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SellerRegistration = () => {
  const [formData, setFormData] = useState({
    brandName: '',
    brandDescription: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',
    documents: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!auth.currentUser) {
      setMessage('You must be logged in to register as a seller.');
      setLoading(false);
      return;
    }

    try {
      // Add seller registration request to Firestore
      const sellerRequest = {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        requestType: 'seller_registration'
      };

      await addDoc(collection(db, 'sellerRequests'), sellerRequest);

      setMessage('Your seller registration request has been submitted successfully. You will be notified once approved.');
      setFormData({
        brandName: '',
        brandDescription: '',
        contactEmail: '',
        contactPhone: '',
        businessAddress: '',
        documents: null
      });
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Register as a Seller</h2>
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand Name</label>
          <input
            type="text"
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand Description</label>
          <textarea
            name="brandDescription"
            value={formData.brandDescription}
            onChange={handleChange}
            required
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Address</label>
          <textarea
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            required
            rows="2"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#FF9900] hover:bg-[#E68A00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9900] ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
};

export default SellerRegistration; 