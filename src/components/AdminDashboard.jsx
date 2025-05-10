import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminNotifications from './AdminNotifications';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaSpinner, FaCheck, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { isAdmin } from '../firebase';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState("sellers");
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productRequests, setProductRequests] = useState([]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Check if user is admin
        if (!isAdmin(currentUser.email)) {
          setError('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }

        await fetchData();
      } catch (err) {
        console.error('Error checking admin access:', err);
        setError('Error loading admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      // Fetch seller requests
      const sellerRequestsQuery = query(collection(db, 'sellerRequests'), where('status', '==', 'pending'));
      const sellerRequestsSnapshot = await getDocs(sellerRequestsQuery);
      const sellerRequestsList = sellerRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSellers(sellerRequestsList);

      // Fetch product requests
      const productRequestsQuery = query(collection(db, 'productRequests'), where('status', '==', 'pending'));
      const productRequestsSnapshot = await getDocs(productRequestsQuery);
      const productRequestsList = productRequestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductRequests(productRequestsList);

      // Fetch approved products
      const productsQuery = query(collection(db, 'products'));
      const productsSnapshot = await getDocs(productsQuery);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError('Error loading data');
    }
  };

  const handleSellerApproval = async (sellerId, approved) => {
    try {
      const sellerRequestRef = doc(db, 'sellerRequests', sellerId);
      const sellerRequest = sellers.find(s => s.id === sellerId);

      if (approved) {
        // Update seller request status
        await updateDoc(sellerRequestRef, { status: 'approved' });

        // Update user role in users collection
        const userRef = doc(db, 'users', sellerRequest.sellerId);
        await updateDoc(userRef, { status: 'approved' });
      } else {
        // Delete seller request
        await deleteDoc(sellerRequestRef);
      }

      await fetchData();
    } catch (error) {
      console.error('Error handling seller approval:', error);
      setError('Error processing seller request');
    }
  };

  const handleProductApproval = async (productId, approved) => {
    try {
      const productRequestRef = doc(db, 'productRequests', productId);
      const productRequest = productRequests.find(p => p.id === productId);

      if (approved) {
        // Add to products collection
        await addDoc(collection(db, 'products'), {
          ...productRequest,
          status: 'approved',
          approvedAt: new Date().toISOString()
        });

        // Update product request status
        await updateDoc(productRequestRef, { status: 'approved' });
      } else {
        // Delete product request
        await deleteDoc(productRequestRef);
      }

      await fetchData();
    } catch (error) {
      console.error('Error handling product approval:', error);
      setError('Error processing product request');
    }
  };

  const handleProductDelete = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Error deleting product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-[#FF9900]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          <AdminNotifications />

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("sellers")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "sellers"
                  ? "bg-[#FF9900] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending Sellers
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "products"
                  ? "bg-[#FF9900] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending Products
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "approved"
                  ? "bg-[#FF9900] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Approved Products
            </button>
          </div>

          {/* Sellers List */}
          {activeTab === "sellers" && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.map(seller => (
                    <tr key={seller.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {seller.brandName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{seller.businessType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{seller.website}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSellerApproval(seller.id, true)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleSellerApproval(seller.id, false)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pending Products List */}
          {activeTab === "products" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productRequests.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="aspect-w-1 aspect-h-1 mb-4">
                    <img
                      src={product.imageURL}
                      alt={product.title}
                      className="w-full h-48 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-500">Seller: {product.sellerEmail}</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleProductApproval(product.id, true)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleProductApproval(product.id, false)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approved Products List */}
          {activeTab === "approved" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="aspect-w-1 aspect-h-1 mb-4">
                    <img
                      src={product.imageURL}
                      alt={product.title}
                      className="w-full h-48 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-500">Seller: {product.sellerEmail}</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleProductDelete(product.id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 