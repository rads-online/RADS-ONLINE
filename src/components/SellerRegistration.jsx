import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const SellerRegistration = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    brandName: '',
    brandDescription: '',
    contactEmail: '',
    contactPhone: ''
  });

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
    setError('');
    setSuccess('');

    try {
      // Create seller request
      const sellerRequest = {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'pending',
        createdAt: new Date()
      };

      // Add to sellerRequests collection
      await addDoc(collection(db, 'sellerRequests'), sellerRequest);

      setSuccess('Your seller registration request has been submitted. You will be notified once approved.');
      setFormData({
        brandName: '',
        brandDescription: '',
        contactEmail: '',
        contactPhone: ''
      });
    } catch (err) {
      setError('Error submitting request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Register as a Seller</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
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
            rows="4"
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

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF9900] hover:bg-[#FF8800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9900] ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Registration Request'}
        </button>
      </form>
    </div>
  );
};

export default SellerRegistration; 