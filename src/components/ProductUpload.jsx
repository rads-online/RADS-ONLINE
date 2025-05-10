import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

const ProductUpload = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    category: '',
    images: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Upload images to Firebase Storage
      const imageUrls = await Promise.all(
        formData.images.map(async (file) => {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );

      // Create product request
      const productRequest = {
        ...formData,
        images: imageUrls,
        sellerId: currentUser.uid,
        sellerEmail: currentUser.email,
        status: 'pending',
        createdAt: new Date()
      };

      // Add to productRequests collection
      await addDoc(collection(db, 'productRequests'), productRequest);

      setSuccess('Product request submitted successfully! Waiting for admin approval.');
      setFormData({
        productName: '',
        description: '',
        price: '',
        category: '',
        images: []
      });
    } catch (err) {
      setError('Error uploading product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload New Product</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900]"
          >
            <option value="">Select a category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Kitchen</option>
            <option value="beauty">Beauty & Personal Care</option>
            <option value="sports">Sports & Outdoors</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            required
            className="mt-1 block w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF9900] hover:bg-[#FF8800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9900] ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Uploading...' : 'Submit Product for Review'}
        </button>
      </form>
    </div>
  );
};

export default ProductUpload;
