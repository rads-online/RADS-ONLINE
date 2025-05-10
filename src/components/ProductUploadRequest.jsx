import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProductUploadRequest = () => {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    brandName: '',
    category: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);

  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setSellerInfo(userDoc.data());
        }
      }
    };
    fetchSellerInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    setMessage('');

    try {
      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `product-images/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const urls = await Promise.all(uploadPromises);
      setImageUrls(prev => [...prev, ...urls]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      setMessage('Error uploading images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!auth.currentUser) {
      setMessage('You must be logged in to submit a product.');
      setLoading(false);
      return;
    }

    // Check if user is a seller
    if (!sellerInfo || sellerInfo.role !== 'seller') {
      setMessage('You must be an approved seller to submit products.');
      setLoading(false);
      return;
    }

    try {
      // Create product request
      const productRequest = {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        requestType: 'product_upload',
        sellerId: auth.currentUser.uid,
        sellerEmail: auth.currentUser.email,
        sellerBrand: sellerInfo.brandName || formData.brandName
      };

      // Add to productRequests collection for admin approval
      await addDoc(collection(db, 'productRequests'), productRequest);

      setMessage('Your product upload request has been submitted successfully. You will be notified once approved.');
      setFormData({
        productName: '',
        description: '',
        price: '',
        brandName: '',
        category: '',
        images: []
      });
      setImageUrls([]);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!sellerInfo || sellerInfo.role !== 'seller') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>You must be an approved seller to upload products. Please contact the administrator for seller account approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Request Product Upload</h2>
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
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
            rows="3"
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
          <label className="block text-sm font-medium text-gray-700">Brand Name</label>
          <input
            type="text"
            name="brandName"
            value={sellerInfo.brandName || formData.brandName}
            onChange={handleChange}
            required
            disabled={!!sellerInfo.brandName}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9900] focus:ring-[#FF9900] disabled:bg-gray-100"
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
            <option value="home">Home & Living</option>
            <option value="beauty">Beauty & Personal Care</option>
            <option value="sports">Sports & Outdoors</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="mt-1 block w-full"
          />
          {imageUrls.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#FF9900] hover:bg-[#E68A00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9900] ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Product Request'}
        </button>
      </form>
    </div>
  );
};

export default ProductUploadRequest; 